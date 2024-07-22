package main

import (
	"log"

	"github.com/BrunoTeleginski/bpf-manager/dataController/data"
	"golang.org/x/net/context"
	"google.golang.org/grpc"
	"google.golang.org/protobuf/types/known/structpb"
)

func main(){
	
	//set the port and connection
	var conn *grpc.ClientConn
	conn, err := grpc.Dial(":9000", grpc.WithInsecure())
	if err != nil {
		log.Fatalf("did not connect: %s", err)
	}
	defer conn.Close()

	//initializing connection from grpc
	c := data.NewDataServiceClient(conn)

	dataSend, err := structpb.NewStruct(map[string]interface{}{
		"firstName": "tops",
	})

	response, err := c.Send(context.Background(), &data.Data{Metadata: dataSend})
	
	if err != nil {
		log.Fatalf("Error when calling SayHello: %s", err)
	}

	log.Printf("From server: %d", response.Status)
}