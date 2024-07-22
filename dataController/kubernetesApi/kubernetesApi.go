package kubernetesapi

import (
	"context"
	"errors"
	"flag"
	"os"
	"path/filepath"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
)

type K8sConfig struct{
	kubernetesClient   *kubernetes.Clientset
}

func localConfig(context string) (*rest.Config, error){
	
	var kubeconfig *string
	if home := homedir.HomeDir(); home != "" {
		kubeconfig = flag.String("kubeconfig", filepath.Join(home, ".kube", "config"), "")
	} else {
		return &rest.Config{}, errors.New("Kubernetes path not found!")
	}

	flag.Parse()

	_, err := clientcmd.BuildConfigFromFlags("", *kubeconfig)
	if err != nil {
		return &rest.Config{}, errors.New("Kubernetes client: error on buinding config file!")
	}

	config, err := buildConfigWithContextFromFlags(context, *kubeconfig)
	if err != nil {
		return &rest.Config{}, errors.New("Kubernetes client: Error on building context!")
	}

	return config, nil
}

func GetKubernetesClient() (*K8sConfig, error) {

	var config *rest.Config
	var err error

	local := os.Getenv("LOCAL_MINIKUBE")

	//check if it's local
	if local == "true"{
		config, err = localConfig("minikube")
		if err != nil{
			return &K8sConfig{}, errors.New("Kubernetes client: Error on getting local minikube config!")
		}
	}else{

		//get the token from service account
		config, err = rest.InClusterConfig()
		if err != nil {
			return &K8sConfig{}, errors.New("Kubernetes client: Service account token not found!")
		}
	}

	kubernetesClient, err := kubernetes.NewForConfig(config)
	if err != nil {
		return &K8sConfig{}, errors.New("Kubernetes client: Error on getting k8s client!")
	}

	return &K8sConfig{
		kubernetesClient: kubernetesClient,
	}, nil
}

//Get all deployment manifest from a pod using a name
func (k *K8sConfig) GetDataFromPodName(podName string) (map[string]interface{}, error){
	
	pods, err := k.kubernetesClient.CoreV1().Pods("").List(context.TODO(), metav1.ListOptions{
		FieldSelector: "metadata.name="+podName,
	})	

	if (err != nil){
		return map[string]interface{}{}, errors.New("Error on communicate with kubernetes API!")
	}

	if len(pods.Items) == 0{
		return map[string]interface{}{}, nil
	}


	containers := []map[string]string{}
	
	for i := 0; i < len(pods.Items[0].Spec.Containers); i++ {

		aMap := map[string]string{
			"name": pods.Items[0].Spec.Containers[i].Name,
			"image": pods.Items[0].Spec.Containers[i].Image,
		}

		containers = append(containers, aMap)
	}


	return map[string]interface{}{
		"pod": pods.Items[0].Name,
		"namespace": pods.Items[0].Namespace,
		"containers": containers,
	}, nil

}

func buildConfigWithContextFromFlags(context string, kubeconfigPath string) (*rest.Config, error) {
	return clientcmd.NewNonInteractiveDeferredLoadingClientConfig(
		&clientcmd.ClientConfigLoadingRules{ExplicitPath: kubeconfigPath},
		&clientcmd.ConfigOverrides{
			CurrentContext: context,
		}).ClientConfig()
}

