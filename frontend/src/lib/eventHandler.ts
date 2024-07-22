import Helper from "../Helpers/helper"

export default class eventHandler{

    eventSource: EventSource
    static classRef:eventHandler
    static eventRoute:string

    static getClass(eventRoute:string){
        if (this.classRef instanceof eventHandler && this.eventRoute == eventRoute){
            return this.classRef
        }else{
            this.eventRoute = eventRoute
            this.classRef = new eventHandler(eventRoute);
            return this.classRef;
        }
    }

    static close(){
        if(this.eventRoute){
            console.log("closing event: ",this.eventRoute)
            this.getClass(this.eventRoute).closeEvent()
        }
    }

    constructor(eventRoute:string){
        this.eventSource = new EventSource(`${Helper.GetInstance().GetEnvVariable("VITE_CONTROLLER_API_HOST")}:${Helper.GetInstance().GetEnvVariable("VITE_CONTROLLER_API_PORT")}`+eventRoute)
    }

    connect(eventName:string, call: ()=>{}){
        this.eventSource.addEventListener(eventName, call)
    }

    closeEvent(){
        this.eventSource.close()
    }

}