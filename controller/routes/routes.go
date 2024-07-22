package routes

import (
	api "github.com/BrunoTeleginski/bpf-manager/backend/api"
	"github.com/BrunoTeleginski/bpf-manager/backend/eventshub"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func LoadApiRoutes() {

	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	//config.AllowOrigins = []string{"http://localhost", "http://localhost:8080"}
	r.Use(cors.New(config))

	// r.GET("/ping", api.Ping)
	// r.GET("/start", api.Start)
	// r.GET("/testevents", api.TestEvents)

	//Get all network information from the pod
	r.GET("/network/:podname", api.GetPodData)
	//Event to update all new network information from pods
	r.GET("/network/event/:podname", eventshub.NewNetworkEvent)
	//Get All Pods
	r.GET("/kubernetes/pods", api.GetAllPods)

	// EventApi(r)
	r.Run()
}

// func EventApi(r *gin.Engine){

// 	r.GET("/events", func(c *gin.Context) {
// 		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
// 		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
// 		c.Writer.Header().Set("Content-Type", "text/event-stream")
// 		c.Writer.Header().Set("Cache-Control", "no-cache")
// 		c.Writer.Header().Set("Connection", "keep-alive")
// 		//send immediately to the client
// 		c.Writer.Flush()

// 		events.NewConnection(c)
// 	})

// }

// func EventNetworkTracker(r *gin.Engine){
	
// 	r.GET("/event/networktracker/:pod", func(c *gin.Context) {

// 		podName := c.Param("pod")
// 		d, dErr := data.GetAndSendNetworkData(podName)
		
// 		if dErr != nil{
// 			events.SendErrorEvent(c, dErr.Error())
// 			return
// 		}

// 		dataByte, err := json.Marshal(d)
// 		if err != nil{
// 			events.SendErrorEvent(c, "Error on converting data byte to json!")
// 			return
// 		}

// 		events.SendEvent(c, dataByte, "networktracker")
// 	})
// }


