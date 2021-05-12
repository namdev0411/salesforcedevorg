({
    createItem:function(component,newItem) {
        let action = component.get("c.saveItem");
        action.setParams({
            campingItem:newItem
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
    }
})