package eventshub

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"time"

	"github.com/BrunoTeleginski/bpf-manager/backend/data"
	"github.com/gin-gonic/gin"
)

type buffer struct{
	Event []byte
	Data []byte
}

var(
	messageBuffer = make(chan *buffer)
)

func Send(msg string, event string){

	messageBuffer <- &buffer{
		Event: []byte(event),
		Data: []byte(msg),
	}
}

func firstHeader(c *gin.Context){
	//First headers responses
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
	c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	//send immediately to the client
	c.Writer.Flush()
}

func NewNetworkEvent(c *gin.Context){
	firstHeader(c)

	//params
	podName := c.Param("podname")

	dataToBeSent := make(chan []byte)

	//find pod network updates every 10 seconds
	go func(){

		for {
			time.Sleep(time.Duration(time.Second * 2))

			dRetutn, err := data.GetPodNetworkData(podName, 0)
			if err != nil{
				dataToBeSent <- []byte("Error on getting the pods network data on Event!")
			}
			
			d, errJson := json.Marshal(dRetutn)
			if errJson != nil{
				dataToBeSent <- []byte("Error on getting the pods network data on Event!")
			}

			dataToBeSent <- d
		}

	}()
	
	//wait until some data get into the var
	msg := <- dataToBeSent

	c.Writer.Write([]byte(fmt.Sprintf("id: %d\n", rand.Int())))
	c.Writer.Write([]byte(fmt.Sprintf("event: %s\n", "networktracker")))
	c.Writer.Write([]byte(fmt.Sprintf("data: %s\n", string(msg))))
	//c.Writer.Write(msg)
	c.Writer.Write([]byte("\n"))
	c.Writer.Flush()


}

func NewConnectionEvent(c *gin.Context){

	//First headers responses
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
	c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	//send immediately to the client
	c.Writer.Flush()
	
	//wait until something got on buffer channel
	buffer := <- messageBuffer
	
	c.Writer.Write([]byte(fmt.Sprintf("id: %d\n", rand.Int())))
	c.Writer.Write([]byte(fmt.Sprintf("event: %s\n", buffer.Event)))
	c.Writer.Write([]byte(fmt.Sprintf("data: %s\n", string(buffer.Data))))
	c.Writer.Write([]byte("\n"))
	c.Writer.Flush()
}

func SendEvent(c *gin.Context, data []byte, event string ){
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
	c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")

	c.Writer.Write([]byte(fmt.Sprintf("event: %s\n", []byte(event))))
	c.Writer.Write([]byte(fmt.Sprintf("data: %s\n", string(data))))
	c.Writer.Write([]byte("\n"))

	//send the buffer immediately
	c.Writer.Flush()
}

func SendErrorEvent(c *gin.Context, msg string){
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
	c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "close")

	c.Writer.Write([]byte(fmt.Sprintf("error: %s\n", msg)))
	c.Writer.Write([]byte("\n"))

	//send the buffer immediately
	c.Writer.Flush()
}