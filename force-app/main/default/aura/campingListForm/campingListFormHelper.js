({
    createItem: function(component,newItem) {
        let createEvent = component.getEvent("addItem");
            createEvent.setParams({"item" : newItem});
            createEvent.fire();
            component.set("v.newItem",{'sobjectType':'Camping_Item__c','Quantity__c':0,'Price__c':0});
            console.log("run");
    }
})