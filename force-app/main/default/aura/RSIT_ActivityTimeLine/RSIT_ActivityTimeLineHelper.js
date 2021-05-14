({
    initHelper : function(component) {
        this.initQuery(component);
    },
    hidePopupAction: function(id) {
        const selfId = 'action-'+id;
        const element= document.getElementById(selfId);
        element.classList.remove('is-open-action');
    },
    initQuery: function(component) {
        let _self = this;
        component.set('v.loading', true);
        const recordId =  component.get('v.recordId');
        const objName = component.get('v.sobjecttype');
        const perPage = component.get('v.pageSize')
        let sortOrder = component.get('v.sortOrder') || 'DESC';
        sortOrder = sortOrder.toUpperCase();
        console.log('recordId:'+recordId+'|objName:'+objName +'|perPage:'+perPage +'|sortOrder:'+sortOrder);
        const params = {
            objName : objName,
            perPage : perPage,
            recordChildIds : [],
            sortOrder: sortOrder
        }
        const iconAction = this.sendAuraRequestWithoutParams(component, 'c.getIconTimeLine', false, false);
        const timeLineAction = this.sendAuraRequestWithParams(component, 'c.initData', params, false, false);
        Promise.all([iconAction, timeLineAction])
        .then($A.getCallback(function([icons,querys]) {
            if (!querys || (querys && querys.length == 0)) {
                return ;
            }
            console.log('querys', querys);
            component.set('v.iconTimeLines', icons);
            let actionTimeLines = _self.buildActionCallQuery(component, querys, recordId, [], null);
            _self.getDataTimeLine(component, actionTimeLines, icons, sortOrder, perPage);
        })).catch(error => {
            console.log(error);
            this.showErrorMessage($A.get("$Label.c.RSIT_Error_SettingMessage"));
        })
    },
    loadMoreHelper: function(component) {
        let _self = this;
        component.set('v.loading', true);
        const activityTimeLines =  component.get('v.activityTimeLines');
        const recordChildIds =  activityTimeLines.map(x=>{
            return x.id;
        });
        const recordId =  component.get('v.recordId');
        const objName = component.get('v.sobjecttype');
        const perPage = component.get('v.pageSize')
        const icons = component.get('v.iconTimeLines');
        let sortOrder = component.get('v.sortOrder') || 'DESC';
        sortOrder = sortOrder.toUpperCase();

        console.log('recordId:'+recordId+'|objName:'+objName +'|perPage:'+'|sortOrder:'+sortOrder);
        const params = {
            objName : objName,
            perPage : perPage,
            recordChildIds : recordChildIds,
            sortOrder: sortOrder
        }
        this.sendAuraRequestWithParams(component, 'c.initData', params, false, false)
        .then($A.getCallback(function(querys) {
            if (!querys || (querys && querys.length == 0)) {
                return ;
            }
            let actionTimeLines = _self.buildActionCallQuery(component, querys, recordId, recordChildIds, null);
            _self.getDataTimeLine(component, actionTimeLines, icons, sortOrder, perPage);
        })).catch(error => {
            console.log(error);
            this.showErrorMessage($A.get("$Label.c.RSIT_Error_SettingMessage"));
        })

    },
    refreshData :  function(component) {
        let _self = this;

        component.set('v.loading', true);
        const timeLineId = component.get('v.timeLineId');
        let activityTimeLines = component.get('v.activityTimeLines');
        const recordId =  component.get('v.recordId');
        const icons = component.get('v.iconTimeLines');
        let activityTimeLine = activityTimeLines.find(x => x.id === timeLineId);

        if (!activityTimeLine) {
            return;
        }
        
        let queryStr = activityTimeLine.queryWrapper.queryStr;
        activityTimeLine.queryWrapper.queryStr = this.convertQueryStr(queryStr);

        const paramTimeLine =  {
            recordId : recordId,
            recordChildIds: [],
            timeLineId : timeLineId,
            queryWrapper :{
                queryStr : activityTimeLine.queryWrapper.queryStr,
                sortField : activityTimeLine.queryWrapper.sortField,
                detailFieldsDescribe : activityTimeLine.queryWrapper.detailFieldsDescribe,
                sortField : activityTimeLine.queryWrapper.sortField,
                subjectField : activityTimeLine.queryWrapper.subjectField,
                eventTypeField: activityTimeLine.queryWrapper.eventTypeField
            }
        };
        this.sendAuraRequestWithParams(component, 'c.callQueryAndGetRecordBack', paramTimeLine, false, false)
        .then($A.getCallback(function(responses) {
            console.log(responses);
            let data = _self.buildDataWrapper(responses, icons);
            if (!data || (data && data.length == 0)) {
              return ;
            }
            const index = activityTimeLines.findIndex(x => x.id == timeLineId);
            data = data[0];
            activityTimeLines[index] = data;

            component.set('v.activityTimeLines', activityTimeLines);
            component.set('v.loading', false);
        })).catch(error => {
            component.set('v.loading', false);
            console.log('error', error);
            this.showErrorMessage($A.get("$Label.c.RSIT_Error_SettingMessage"));
        })
    },
    buildDataWrapper : function(data, icons) {
        return data.map(item => {
            const subjectApiName = item.queryWrapper.subjectField;
            const record = JSON.parse(item.recordJson);
            const eventTypeField = item.queryWrapper.eventTypeField;
            const detailFieldsDescribe =  item.queryWrapper.detailFieldsDescribe;
            const descrioption = record.Description || '';
            const type = record[eventTypeField] || 'OTHER';
            const icon = icons.find(x=>x.DeveloperName == type);
            let subject = record[subjectApiName] || '';
            if (type.toUpperCase() == 'EMAIL') {
                subject = subject.split(':')[1] || '[No Subject]';
            }

            item.id = item.recordId;
            item.subject = subject;
            item.type = type.toUpperCase();
            item.createdDate = (type == 'Email')? record.CreatedDate : item.sortFieldData;
            item.iconName = icon ? icon.Icon_name__c : 'standard:default';
            item.classTimeLine = this.getClassTimeLineByType(type);
            item.description = descrioption;
            item.detailFieldsDescribe = this.buildDataDetailFieldsDescribe(detailFieldsDescribe, record);

            return item;
        });

    },
    buildDataDetailFieldsDescribe: function(detailFieldsDescribe, record) {
        return detailFieldsDescribe.map(item => {
            const apiName = item.apiName;
            const value = record[apiName] || '';
            item.value = value;
            if(item.type == 'REFERENCE') {
                const relationshipDisplayField = item.relationshipDisplayField;
                item.relationTo = record[relationshipDisplayField.split('.')[0]];
            }
            return item;
        })

    },
    buildActionCallQuery : function(component, querys, recordId, recordChildIds, timeLineId) {
        let _self = this;
        let actionTimeLines = [];
        querys.forEach(query => {
            const paramTimeLine =  {
                recordId : recordId,
                recordChildIds: recordChildIds,
                timeLineId : timeLineId,
                queryWrapper :{
                    queryStr : query.queryStr,
                    sortField : query.sortField,
                    detailFieldsDescribe : query.detailFieldsDescribe,
                    sortField : query.sortField,
                    subjectField : query.subjectField,
                    eventTypeField: query.eventTypeField
                }
            };
            console.log('buildcallquery: '+JSON.stringify(paramTimeLine));
            const actionTimeLine = _self.sendAuraRequestWithParams(component, 'c.callQueryAndGetRecordBack', paramTimeLine, false, false);
            actionTimeLines.push(actionTimeLine);
        });
        return actionTimeLines
        
    },
    getDataTimeLine: function (component, actionTimeLines, icons, sortOrder, perPage) {
        let _self = this;
        Promise.all(actionTimeLines)
        .then($A.getCallback(function(responses) {
            let activityTimeLines = [];
            responses.forEach(activityTimeLine => {
                if (activityTimeLine && activityTimeLine.length >0 ) {
                    activityTimeLines.push(...activityTimeLine);
                }
            });
            activityTimeLines = _self.sortByDate(activityTimeLines, sortOrder).slice(0, perPage);
            const dataTimeLineNew = _self.buildDataWrapper(activityTimeLines, icons);
            let dateTimeLines = component.get('v.activityTimeLines');
            dateTimeLines = [...dateTimeLines, ...dataTimeLineNew];

            component.set('v.isLoadMore', (activityTimeLines.length >= perPage));
            component.set('v.activityTimeLines', dateTimeLines);
            component.set('v.loading', false);
           
        })).catch(error => {
            component.set('v.loading', false);
            console.log('error', error);
            this.showErrorMessage('Error setiing!');
        })
    },
    getEmailMessageFromDB: function (component, taskId) {
        const param = {
            taskId : taskId
        }
        this.sendAuraRequestWithParams(component, 'c.getEmailMessage', param, false, false)
        .then($A.getCallback(function(emailMessage) {
            if(emailMessage) {
                var navEvt = $A.get("e.force:navigateToSObject");
                navEvt.setParams({
                  "recordId": emailMessage.Id,
                  "slideDevName":"detail"
                });
                navEvt.fire();
            }
        })).catch(error => {
            component.set('v.loading', false);
            console.log('error', error);
            this.showErrorMessage('Error');
        })
    },
    getClassTimeLineByType : function(type) {
        let classTimeLine = '';
        type = type.toUpperCase();
        switch (type) {
            case 'CALL':
                classTimeLine = 'slds-timeline__item_call';
                break;
            case 'TASK':
                classTimeLine = 'slds-timeline__item_task';
                break;
            case 'EVENT':
                classTimeLine = 'slds-timeline__item_event';
                break;
            case 'EMAIL':
                classTimeLine = 'slds-timeline__item_email';
                break;
            case 'OTHER':
                classTimeLine = 'slds-timeline__item_other';
                break;
            default:
                break;
        }
        return classTimeLine;
    },
    convertQueryStr: function (queryStr) {
        if (queryStr.indexOf(':recordId)') != -1) {
            const condition = ':recordId) AND Id = :timeLineId ';
            queryStr =  queryStr.replace(':recordId)', condition);
        } else if (queryStr.indexOf(':recordId') != -1) {
            const condition = ':recordId AND Id = :timeLineId ';
            queryStr =  queryStr.replace(':recordId', condition);
        }
        return queryStr;
    },

    deleteRecordTL : function(component) {
        let _self = this;
        const recordId =  component.get('v.timeLineId');
        const param = {
            "recordId" : recordId
        }
        this.sendAuraRequestWithParams(component, 'c.deleteActivityTimeLine', param, false, false)
        .then($A.getCallback(function(result) {
            if(result) {
                component.set('v.showModalDelete', false);
                _self.removeItemTimeLine(component, recordId);
                _self.showSuccessMessage($A.get("$Label.c.RSIT_Success_DeleteMessage"));
            } else {
                _self.showErrorMessage($A.get("$Label.c.RSIT_Error_DeleteMessage"));
            }
        })).catch(error => {
            console.log('error', error);
            _self.showErrorMessage($A.get("$Label.c.RSIT_Error_DeleteMessage"));
        })

    },

    sortByDate: function(arr, sortOrder) {
        console.log('sortOrder', sortOrder);
        arr.sort(function(a,b){
            if (sortOrder == 'DESC') {
                return (typeof b.sortFieldData == 'undefined') - (typeof a.sortFieldData =='undefined')  
                || Number(new Date(b.sortFieldData)) - Number(new Date(a.sortFieldData));
    
            } else {
                return (typeof b.sortFieldData == 'undefined') - (typeof a.sortFieldData =='undefined')  
                || Number(new Date(a.sortFieldData)) - Number(new Date(b.sortFieldData));
            }
        });
       
        return arr;
    },
    sendAuraRequestWithoutParams: function(component, actionName, passError, isAsync) {
        const action = component.get(actionName);

		if (isAsync) {
			action.setBackground();
		}

		return this.sendAuraRequest(action, passError);
	},
    removeItemTimeLine: function(component, recordId) {
        let activityTimeLines = component.get('v.activityTimeLines');
        const element= document.getElementById(recordId);
        element.remove();
        activityTimeLines =  activityTimeLines.filter(x =>x.id != recordId);
        component.set('v.activityTimeLines', activityTimeLines);

    },
	sendAuraRequestWithParams: function(component, actionName, params, passError, isAsync) {
		const action = component.get(actionName);
		action.setParams(params);
		if (isAsync) {
			action.setBackground();
		}

		return this.sendAuraRequest(action, passError);
	},

	sendAuraRequest: function(action, passError) {
		return new Promise($A.getCallback(function (resolve, reject) {
	        action.setCallback(this, function(response) {
	            const state = response.getState();
	            let res = response.getReturnValue();
	            if (state === 'SUCCESS') {
	                resolve(res);

	            } else {
                    if (passError) {
                        resolve();
                    } else {
                        reject();
                    }
	            }
	        });
	        $A.enqueueAction(action);
	    }));
	},
   
    showErrorMessage : function (error) {
	
		this.showMessage("error", error); 
	},

	showSuccessMessage : function (message) {
		this.showMessage("success", message); 
	},
	showMessage : function (type, message) {
		var showToast = $A.get("e.force:showToast"); 
		showToast.setParams({ 
			"type": type,
			"message" : message,
			"mode": "dismissible",
			duration: 10000
		}); 
		showToast.fire();
	}
})