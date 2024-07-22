//NOTE: Global interfaces for components
export interface IList{
    key: Number,
    value: String,
}
/* <select> html components */
export interface ISelectInput{
    displayName: string,
    key: string,
    value: string,
    list: Array<IList>
    changeFunc: (value:string) => {}
}
/* <input> html components */
export interface IInput{
    displayName: string,
    key: string,
    value: string,
    changeFunc: (value:string) => {}
}


//NOTE: Data holders
/* List of options for event types in the kernel */
export const BPF_FORM_EVENT_TYPE_LIST:Array<IList> = [
    {
        key: 1,
        value: "Tracepoint"
    }
]



