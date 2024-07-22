class Helper{

    static classRef

    static GetInstance(){
        if (this.classRef instanceof Helper){
            return this.classRef
        }else{
            this.classRef = new Helper()
            return this.classRef
        }
    }

    constructor(){}

    GetEnvVariable(evar){
        console.log(import.meta.env[evar])
        return import.meta.env[evar]
    }
}

export default Helper