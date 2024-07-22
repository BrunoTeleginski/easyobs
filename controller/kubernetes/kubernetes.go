package kubernetes

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	apiWatch "k8s.io/apimachinery/pkg/watch"

	eventshub "github.com/BrunoTeleginski/bpf-manager/backend/eventshub"
)

var (
	DEFAULT_NAMESPACE   string = "default"
	NODE_WATCHER_NAME   string = "ebpf-manager-watcher"
	NODE_WATCHER_LABELS        = map[string]string{
		"bpf-manager": "true",
		"app":         NODE_WATCHER_NAME,
	}
	TRUE_OP = true
	SEARCH_SCHEMA= metav1.ListOptions{
		LabelSelector: "app=" + NODE_WATCHER_NAME + ",bpf-manager=true",
	}

)

func NodeWatcherStatus(){
	client := GetKubernetesClient()
	
	for{
		time.Sleep(3 * time.Second)
		
		daemonset, err := client.AppsV1().DaemonSets(DEFAULT_NAMESPACE).List(context.TODO(), SEARCH_SCHEMA)
		if err != nil {
			log.Println(err)
		}

		if (len(daemonset.Items) > 0){
			eventshub.Send("watcher:running", "watcher")
		}else{
			eventshub.Send("watcher:stopped", "watcher")
		}
	}
}

func IsNodeWatcherDeployed() bool {

	client := GetKubernetesClient()
	daemonset, err := client.AppsV1().DaemonSets(DEFAULT_NAMESPACE).List(context.TODO(), SEARCH_SCHEMA)

	if err != nil {
		log.Println(err)
	}

	return len(daemonset.Items) > 0
}

/*
It deploys a daemonset that attaches a BPF program to get relevant information from the node.
*/
func DeployNodeWatcher() {

	client := GetKubernetesClient()

	if IsNodeWatcherDeployed() {
		eventshub.Send("watcher:running", "watcher")
		return
	}

	daemonset := &appsv1.DaemonSet{
		ObjectMeta: metav1.ObjectMeta{
			Name:   NODE_WATCHER_NAME,
			Labels: NODE_WATCHER_LABELS,
		},

		Spec: appsv1.DaemonSetSpec{
			Selector: &metav1.LabelSelector{
				MatchLabels: NODE_WATCHER_LABELS,
			},
			Template: v1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: NODE_WATCHER_LABELS,
				},

				Spec: apiv1.PodSpec{
					Volumes: []apiv1.Volume{
						{
							Name: "kerneltraces",
							VolumeSource: apiv1.VolumeSource{
								HostPath: &apiv1.HostPathVolumeSource{
									Path: "/sys/kernel/debug",
								},
							},
						},
						{
							Name: "kernelmodules",
							VolumeSource: apiv1.VolumeSource{
								HostPath: &apiv1.HostPathVolumeSource{
									Path: "/lib/modules",
								},
							},
						},
						{
							Name: "kernelsrc",
							VolumeSource: apiv1.VolumeSource{
								HostPath: &apiv1.HostPathVolumeSource{
									Path: "/usr/src/",
								},
							},
						},
					},
					Containers: []apiv1.Container{
						{
							SecurityContext: &apiv1.SecurityContext{
								Privileged: &TRUE_OP,
							},
							Name:  "worker",
							Image: "brunoteleginski/bpf-xdp:v4.0.5-arm",
							// Ports: []apiv1.ContainerPort{
							// 	{
							// 		Name:          "http",
							// 		Protocol:      apiv1.ProtocolTCP,
							// 		ContainerPort: 80,
							// 	},
							// },
							VolumeMounts: []v1.VolumeMount{
								{
									Name:      "kerneltraces",
									MountPath: "/sys/kernel",
								},
								{
									Name:      "kernelmodules",
									MountPath: "/lib/modules",
								},
								{
									Name:      "kernelsrc",
									MountPath: "/usr/src/",
								},
							},
							Command: []string{
								"/bin/bash", "-c", "sleep 100000",
							},
						},
					},
				},
			},
		},
	}

	_, err := client.AppsV1().DaemonSets(DEFAULT_NAMESPACE).Create(context.TODO(), daemonset, metav1.CreateOptions{})
	if err != nil {
		log.Println(err)
		eventshub.Send("watcher:error", "watcher")
	}

	eventshub.Send("watcher:running", "watcher")
}

/*
Function that set up a watcher on the BPF daemonset that collects informations from the nodes.
*/
func SetWatcher(){
	client := GetKubernetesClient()

	watch, err := client.AppsV1().DaemonSets(DEFAULT_NAMESPACE).Watch(context.TODO(), SEARCH_SCHEMA)
	if err != nil {
		log.Println(err)
	}

	for{
		event, ok := <-watch.ResultChan()
		if !ok {
			log.Println("Error on the watcher!")
		}

		daemon, err := event.Object.(*appsv1.DaemonSet)
		if !err {
			log.Println(err)
		}
		
		creationTime := daemon.GetCreationTimestamp()

		fmt.Println(event.Type," ",daemon.Name)

		//skip event older then 20 minutes
		if creationTime.Time.Before(time.Now().Add(-5*time.Minute)) {
			log.Println("Skipping older events...")
			continue
		}
		
		switch event.Type {
			case apiWatch.Added:
				//wscontroller.SendBroadcastMsg("watcher:Added")

			case apiWatch.Deleted:
				//wscontroller.SendBroadcastMsg("watcher:Deleted")
		}
	}
}

/*
Function that returns pod names
*/
func GetPodNames() ([]string, error){

	client := GetKubernetesClient()

	podList, err := client.CoreV1().Pods("").List(context.Background(), metav1.ListOptions{})
	if err != nil{
		return []string{}, errors.New(err.Error())
	}

	dataReturn := []string{}
	for _,pod := range(podList.Items){
		dataReturn = append(dataReturn, pod.Name)
	}

	return dataReturn, nil
}