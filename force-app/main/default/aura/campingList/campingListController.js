({
    doInit:function(component, event, helper){
        let action = component.get("c.getItems");
      
        action.setCallback(this,function(res){
            if(res.getState()==="SUCCESS"){
                component.set("v.items",res.getReturnValue());
            }
        })
        $A.enqueueAction(action);
    },
    handleAddItem:function(component, event, helper){
        let newItem = event.getParam("item");
        let action = component.get("c.saveItem");
        action.setParams({
            'campingItem':newItem
        })
        action.setCallback(this,function(res){
            if(res.getState()==="SUCCESS"){
                let campingList = component.get("v.items");
                campingList.push(newItem);
                component.set("v.items",campingList);
            }else{
                console.log(res.getError);
            }
        })
        $A.enqueueAction(action);
        // helper.createItem(component,newItem);
    }
})