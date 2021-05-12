({
    clickCreateItem : function(component, event, helper) {
        let newItem= component.get("v.newItem");
        let validCamping = component.find("campingform").reduce((valid,inputCmp)=>{
            inputCmp.showHelpMessageIfInvalid();
            return valid && inputCmp.get('v.validity').valid;
        },true);
        if(validCamping){
            helper.createItem(component,newItem);
        }
    }
})