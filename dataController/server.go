package main

import (
	"github.com/BrunoTeleginski/bpf-manager/dataController/data"
	kubernetesapi "github.com/BrunoTeleginski/bpf-manager/dataController/kubernetesApi"
)

func main(){

	k8sClient, err := kubernetesapi.GetKubernetesClient()

	if err != nil{
		panic(err.Error())
	}

	grpcServer := data.GrpcServer{
		Port: "9000", 
		K8sConfig: k8sClient,
	}

	grpcServer.Start()

	//grpcServer.K8sConfig.GetDataFromPodName("coredns-5d78c9869d-bvlf2")
}