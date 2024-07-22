package wscontroller

import (
	"flag"
	"log"
	"net/http"
)

var (
	addr = flag.String("localhost", ":8081", "http service address")
	hubContext *Hub
)

func LoadHubContext() (*Hub){
	if hubContext != nil{
		return hubContext
	}

	hubContext = newHub()
	return hubContext
}

func Load(){
	hubContext = LoadHubContext()
	go hubContext.run()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(hubContext, w, r)
	})

	err := http.ListenAndServe(*addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func SendBroadcastMsg(msg string){
	hubContext = LoadHubContext()
	hubContext.broadcast <- []byte(msg)
}