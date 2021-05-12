import { api, LightningElement } from 'lwc';
const TYPE = {
    task:"task",
    call:"call",
    email:"email",
    event:"event",
    case:"case",
    other:"other"
}
export default class CustomTimeLine extends LightningElement {
    @api activityData = [
        {
            object:"Mobile conversation on Monday",
            name: "Adam Chan",
            description: "Adam seemed interested in closing this deal quickly! Let’s move.",
            type: TYPE.call
        },
        {
            object: "Re: Mobile conversation on Monday with the new global team",
            fromAddress: "Jackie Dewar",
            toAddress: "Lea Chan",
            textBody: "Hi everyone, Thanks for meeting with the team today and going through the proposals we saw. This goes on and wraps if needed.",
            type: TYPE.email
        },
        {
            object: "EBC Follow up call,                ",
            location:"Westen St. Francis",
            when: "March 26, 10:00 AM - 11:00 AM",
            description: "Let's discuss the 2017 product roadmap and address any questions",
            type: TYPE.event
        },
        {
            object: "Review proposals for EBC deck with larger team and have marketing review this",
            name: "Charlie Gomez",
            description: "Need to finalize proposals and brand details before the meeting.",
            type: TYPE.task,
            relatedTo:"Tesla Cloudhub + Anypoint Connectors"
        },
        {
            object: "other is test",
            name: "Other",
            description: "Other activity",
            type: TYPE.other
        }
        
    ];
    isShowRemoveConfirm=false;
    isShowEditForm = false;
    editRecordId = undefined;
    handleOpenEditForm = (e)=>{
        const {recordId} = e.detail;
        console.log('edit record Id= '+ recordId);
        this.isShowEditForm = true;
        console.log(this.isShowEditForm);

    }
    /////
    handleOpenConfirmToRemove = (e)=>{
        const {recordId} = e.detail;
        console.log('remove record Id= '+ recordId);
        this.isShowRemoveConfirm = true;
    }
    handleConFirmClick=(e)=>{
        const confirm = e.target.name;
        if(confirm == "confirm"){
            //Call Api and update list

            this.isShowRemoveConfirm = false;
        }else{
            this.isShowRemoveConfirm=false;
        }
    }
    handleEditFormClick=(e)=>{
        const confirm = e.target.name;
        if(confirm =="submit"){
            //Call Api and update list
            this.isShowEditForm = false;
        }else{
            this.isShowEditForm = false;
        }
    }
}