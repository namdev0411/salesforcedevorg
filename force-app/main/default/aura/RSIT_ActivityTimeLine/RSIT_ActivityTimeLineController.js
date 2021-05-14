({
    init : function(component, event, helper) {
        helper.initHelper(component);
    },
    showDescriptionHandle : function(component, event, helper) {
        const id = event.currentTarget.dataset.id;
        const element=  document.getElementById(`${id}`);
        element.classList.toggle('slds-is-open');
    },
    showAction : function(component, event, helper) {
        const id = event.currentTarget.dataset.id;
        const selfId = 'action-'+id;
        component.set('v.actionId', selfId);
        const elementAll = document.getElementsByClassName('uiMenuList');
        const element= document.getElementById(selfId);
        const isHidden = window.getComputedStyle(element).display == "none";

        [].forEach.call(elementAll, function(el) {
            if (el.id != selfId) {
                if (el) {
                    el.classList.remove('is-open-action');
                }
              
            }
        });

        if (isHidden) {
            if (element) {
                element.classList.add('is-open-action');
            }
            component.set('v.actionOpen', selfId);
        }  else {
            if (element) {
                element.classList.remove('is-open-action');
            }
            component.set('v.actionOpen', '');
        }
    },

    editHandle:function(component, event, helper) {
        const recordId = event.currentTarget.dataset.recordid;
        const id = event.currentTarget.dataset.id;
        component.set('v.timeLineId', recordId);
        component.set('v.actionName', 'EDIT');
        helper.hidePopupAction(id);
        var editRecordEvent = $A.get("e.force:editRecord");
        editRecordEvent.setParams({
            "recordId": recordId
        });
        editRecordEvent.fire();
    },
    openModalDeleteHandle: function(component, event, helper) {
        const recordId = event.currentTarget.dataset.recordid;
        const id = event.currentTarget.dataset.id;
        helper.hidePopupAction(id);
        component.set('v.timeLineId', recordId);
        component.set('v.showModalDelete', true);
    },
    closeModalDeleteHandle: function(component, event, helper) {
        component.set('v.showModalDelete', false);
    },
    handleDeleteRecord: function(component, event, helper) {
       helper.deleteRecordTL(component);
    },
    loadMoreHandle : function(component, event, helper) {
        let scrollTopPosition = component.get('v.scrollTopPosition');
        const pageSize =  component.get('v.pageSize');
        helper.loadMoreHelper(component);
        window.scrollTo({
            top: scrollTopPosition,
            behavior: 'smooth',
        });
        scrollTopPosition += pageSize*40;
        component.set('v.scrollTopPosition', scrollTopPosition);
    },
    showEmailHandle : function(component, event, helper) {
        const taskId = event.currentTarget.dataset.id;
        helper.getEmailMessageFromDB(component, taskId);
    },
    refreshData : function(component, event, helper) {
        const actionName = component.get('v.actionName');
        if (actionName == 'EDIT') {
            helper.refreshData(component)
        }
        component.set('v.actionName', '');
    },
    hideAction : function(component, event, helper) {
        const selfId = component.get('v.actionId');
        const element= document.getElementById(selfId);
        window.setTimeout(   
            $A.getCallback(function() {
                if (element) {
                    element.classList.remove('is-open-action');
                    component.set('v.actionId', '')
                }
         }), 200);
    },
   
})