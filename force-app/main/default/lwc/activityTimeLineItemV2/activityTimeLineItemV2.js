import { LightningElement,api, track } from 'lwc';
const TYPE = {
    task:"task",
    call:"call",
    event:"event",
    email:"mail",
    other:"other",
}

export default class ActivityTimeLineItemV2 extends LightningElement {
    @api item;
  
    @track isTask = false;
    @track isEmail = false;
    @track isEvent = false;
    @track isOther = false;
    @track isCall = false;
       

   connectedCallback(){
        this.checkType();
   }
   @track checkType = ()=>{
       switch(this.item.type){
            case TYPE.task:{
                this.isTask = true;
                break;
            }
            case TYPE.email:{
                this.isEmail = true;
                break;
            }
            case TYPE.event:{
                this.isEvent = true;
                break;
            }
            case TYPE.call:{
                this.isCall = true;
                break;
            }
            case TYPE.other:{
                this.isOther = true;
                break;
            }
       }
    }
}