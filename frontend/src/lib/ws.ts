export default class ws {

    socket: any;
    static classItself: ws;

    static getClass(){
        if (this.classItself instanceof ws){
            return this.classItself
        }else{
            this.classItself = new ws();
            return this.classItself;
        }
    }

    static getSocket(){
        if(this.classItself instanceof ws){
            return this.classItself.socket
        }

        return null
    }

    constructor() {
        this.socket = new WebSocket("ws://localhost:8081/ws");
    }

    connect(readCallback: (event:any)=>{}){
        try {
            // Connection opened
            this.socket.addEventListener("open", (event) => {
                this.socket.send("Hello Server!");
            });
            
            this.socket.addEventListener("message", readCallback)

        } catch (er) {
            console.error("WS: ",er)
            return false
        }
    }
}
