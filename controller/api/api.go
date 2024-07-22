package api

import (
	"net/http"

	"github.com/BrunoTeleginski/bpf-manager/backend/data"
	events "github.com/BrunoTeleginski/bpf-manager/backend/eventshub"
	kubernetes "github.com/BrunoTeleginski/bpf-manager/backend/kubernetes"

	"github.com/gin-gonic/gin"
)


func Ping(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "pong",
	})
}

func Start(c *gin.Context) {
	go kubernetes.DeployNodeWatcher()

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
	})
}

func TestEvents(c *gin.Context){
	go events.Send("TESTANDOOOO", "global")
}

func GetPodData(c *gin.Context){

	//params
	podName := c.Param("podname")

	if podName == ""{
		c.JSON(400, map[string]interface{}{"msg": "Parameter pod name cannot be null!"})
	}

	d, dErr := data.GetPodNetworkData(podName, 15)
	if dErr != nil{
		c.JSON(400, map[string]interface{}{"msg": dErr.Error()})
	}

	// dataByte, err := json.Marshal(d)
	// if err != nil{
	// 	c.JSON(400, map[string]interface{}{"msg": dErr.Error()})
	// }

	c.JSON(200, d)
}

func GetAllPods(c *gin.Context){

	posList, err := kubernetes.GetPodNames()
	if err != nil{
		c.JSON(400, map[string]interface{}{"msg": err.Error()})
	}

	c.JSON(200, posList)
}