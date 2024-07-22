package kubernetes

import (
	"flag"

	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

var (
	KUBECONFIG_CONTEXT string = "minikube"
	kubernetesClient   *kubernetes.Clientset
)

func GetKubernetesClient() *kubernetes.Clientset {

	if kubernetesClient != nil {
		return kubernetesClient
	}

	//NOTE: only running local
	//var kubeconfig *string
	// if home := homedir.HomeDir(); home != "" {
	// 	kubeconfig = flag.String("kubeconfig", filepath.Join(home, ".kube", "config"), "")
	// } else {
	// 	panic("Kube config path not found!")
	// }

	flag.Parse()

	config, err := clientcmd.BuildConfigFromFlags("", "")
	if err != nil {
		panic(err.Error())
	}

	// config, err := _BuildConfigWithContextFromFlags(KUBECONFIG_CONTEXT, *kubeconfig)
	// if err != nil {
	// 	panic(err)
	// }

	kubernetesClient, err = kubernetes.NewForConfig(config)
	if err != nil {
		panic(err)
	}

	return kubernetesClient
}

func _BuildConfigWithContextFromFlags(context string, kubeconfigPath string) (*rest.Config, error) {
	return clientcmd.NewNonInteractiveDeferredLoadingClientConfig(
		&clientcmd.ClientConfigLoadingRules{ExplicitPath: kubeconfigPath},
		&clientcmd.ConfigOverrides{
			CurrentContext: context,
		}).ClientConfig()
}
