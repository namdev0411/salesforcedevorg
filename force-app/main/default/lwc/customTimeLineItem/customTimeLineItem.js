import { LightningElement,api } from 'lwc';
import icons from '@salesforce/resourceUrl/icons';
const TYPE = {
    task:"task",
    call:"call",
    email:"email",
    event:"event",
    case:"case",
    other:"other"
}
export default class CustomTimeLineItem extends LightningElement {
   @api item;
  
    isTask = false;
    isEmail = false;
    isEvent = false;
    isOther = false;
    isCall = false;
    showOption = false;
       
   iconsUrl = icons;
   taskUrl = icons+ '/standard/task_60.png';
   callUrl = icons+ '/standard/log_a_call_60.png';
   emailUrl = icons+ '/standard/email_60.png';
   eventUrl = icons+ '/standard/event_60.png';
   caseUrl = icons+ '/standard/case_60.png';
   otherUrl = icons + '/standard/asset_relationship_60.png';
   downUrl = icons + '/utility/down_60.png';
   chevrondownURL = icons+ '/utility/chevrondown_60.png';
   chevronrightURL = icons+ '/utility/chevronright_60.png';

   connectedCallback(){
        this.checkType();
   }
   checkType = ()=>{
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
            }
            case TYPE.other:{
                this.isOther = true;
                break;
            }
       }
   }
    toggleDetail=(e)=>{
        const recordId = e.target.getAttribute('data-id');
        const ele=  this.template.querySelector(`div[data-id=${recordId}]`);
        ele.classList.toggle('slds-is-open');
   }
    showOptions=(e)=>{
        // const ele = this.template.querySelector('.edit-remove-btn');
        e.target.lastElementChild.classList.toggle('active');
    }   
    openEditModal = (e)=>{
        const ele = this.template.querySelector('.edit-remove-btn');
        const recordId = e.target.getAttribute('data-id');
        ///
        ele.lastElementChild.classList.remove('active');
        const openEvent = new CustomEvent("openeditform", {
            detail: {
                recordId
            }
        });
        this.dispatchEvent(openEvent);
   }
    openConfirmToRemove=(e)=>{
        const ele = this.template.querySelector('.edit-remove-btn');
        const recordId = e.target.getAttribute('data-id');
        const openEvent = new CustomEvent("openconfirmtoremove", {
            detail: {
                recordId
            }
        });
        this.dispatchEvent(openEvent);
        ele.lastElementChild.classList.remove('active');
    }
}