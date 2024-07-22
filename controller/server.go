package main

//"github.com/BrunoTeleginski/bpf-manager/backend/kubernetes"
import (
	"github.com/BrunoTeleginski/bpf-manager/backend/routes"
)

// func loadWsAndWatcher(){
// 	go wscontroller.Load()
// 	kubernetes.SetWatcher()
// }

/* Routes */
func main() {
	//go loadWsAndWatcher()
	//go kubernetes.NodeWatcherStatus()
	routes.LoadApiRoutes()
}
