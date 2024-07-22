package data

import (
	"errors"
	"fmt"
	"log"
	"net"
	"strconv"
	"time"

	"github.com/BrunoTeleginski/bpf-manager/dataController/db"
	kubernetesapi "github.com/BrunoTeleginski/bpf-manager/dataController/kubernetesApi"
	"golang.org/x/net/context"
	"google.golang.org/grpc"
)

var (
	TYPE_NETWORK="network"
)

type GrpcServer struct{
	Port string
	K8sConfig *kubernetesapi.K8sConfig
}

func (s *GrpcServer) Start() {

	lis, err := net.Listen("tcp", ":"+s.Port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	grpcServer := grpc.NewServer()
	RegisterDataServiceServer(grpcServer, s)

	log.Println("Listening to GRPC...")

	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %s", err)
	}
}

// mustEmbedUnimplementedDataServiceServer implements DataServiceServer.
func (*GrpcServer) mustEmbedUnimplementedDataServiceServer() {
	panic("unimplemented")
}



//GRPC function to send data from the client
func (s *GrpcServer) Send(ctx context.Context, in *Data) (*Status, error) {

	if in.Metadata == nil{
		return &Status{Status: 0}, nil
	}

	//The function uses the kubernetes API to get more information from the pod name
	finishStatus := make(chan *Status)
	finishError := make(chan error)

	go func(){

		//in.Metadata.AsMap()["src_pod_name"].(string)
		pod, err := s.K8sConfig.GetDataFromPodName(in.Metadata.AsMap()["src_pod_name"].(string))
		if err != nil{
			finishError <- errors.New("Fail on getting Pod informations!")
		}else if pod == nil {
			finishStatus <- &Status{Status: 0}
		}

		//Check if the record is a DNS
		if _, ok := in.Metadata.AsMap()["dns"]; ok {

			pod["dst"] = in.Metadata.AsMap()["dst"].(string)
			pod["process"] = in.Metadata.AsMap()["process"].(string)
			pod["time"] = in.Metadata.AsMap()["time"].(string)
			pod["dst_port"] = 53

		}else{

			//ADD metadata to the pod data map
			pod["pid"] = int(in.Metadata.AsMap()["pid"].(float64))
			pod["src_ip"] = in.Metadata.AsMap()["src_ip"].(string)
			pod["dst"] = in.Metadata.AsMap()["dst"].(string)
			pod["dst_port"] = int(in.Metadata.AsMap()["dst_port"].(float64))
			pod["process"] = in.Metadata.AsMap()["process"].(string)
			pod["time"] = in.Metadata.AsMap()["time"].(string)
		}
		
		

		//save the data on DB
		dbconn := db.GetDefaultDBconnection()

		key := in.Metadata.AsMap()["src_pod_name"].(string)+":"+strconv.FormatInt(time.Now().Unix(), 10)

		dbStatus, dbErr := dbconn.Save(key, pod)
		if dbErr != nil{
			finishError <- errors.New("Fail to save the data: "+ dbErr.Error())
		}else if !dbStatus{
			finishStatus <- &Status{Status: 0}
		}
		
		finishStatus <- &Status{Status: 1}
	}()

	
	select {
		case status := <-finishStatus:
			fmt.Println(status)
			return status,nil
		case statusError := <-finishError:
			fmt.Println(statusError)
			return nil, statusError
	}
}
