import { LightningElement,api,track,wire} from 'lwc';
import { NavigationMixin } from "lightning/navigation";
import initData from '@salesforce/apex/RSIT_ActivityTimeLineController.initData';
import getIconTimeLine from '@salesforce/apex/RSIT_ActivityTimeLineController.getIconTimeLine';
import callQueryAndGetRecordBack from '@salesforce/apex/RSIT_ActivityTimeLineController.callQueryAndGetRecordBack';
import deleteActivityTimeLine from '@salesforce/apex/RSIT_TimeLineController.deleteActivityTimeLine';
import { subscribe, unsubscribe, onError } from 'lightning/empApi';
import {refreshApex} from '@salesforce/apex';
export default class ActivyTimeLineV2 extends NavigationMixin(LightningElement) {
    @wire(getIconTimeLine) wireicons;
    @api activityData = [];
    @api objectApiName;
    @api recordId;
    @track isShowRemoveConfirm=false;
    @api perPage;
    @api sortOrder; 
    @track isLoading = true;
    @track isCanLoadMore = true;
    @track deleteId;
    @track enbleReload = false;
    
    subscription = {};
    CHANNEL_NAME = '/event/RefreshActivityTimeLineLwc__e';
    get icons(){
        return this.wireicons.data
    };
    connectedCallback(){
        this.callGetData();
        subscribe(this.CHANNEL_NAME, -1, this.updateRecord).then(response => {
            this.subscription = response;
            // console.log(JSON.stringify(response));
        });
        onError(error => {
            console.error('Server Error--->'+error);
        });
    }
    @track getClassTimeLineByType=(type)=>{
        return 'slds-timeline__item_expandable slds-timeline__item_'+type.toLowerCase();
    }
    callGetData= ()=>{
        //init data
        let _self = this;
        let paramToInitMethod={
            objName:_self.objectApiName,
            perPage:this.perPage,
            recordChildIds:[],
            sortOrder:this.sortOrder
        }
        Promise.all([initData(paramToInitMethod)])
        .then(([querys])=>{
            if(!querys || (querys && querys.length == 0)){
                return;
            }
            _self.actionTimeLines = _self.buildActionCallQuery(querys,[]);
            _self.getDataTimeLine(_self.actionTimeLines);
        })
    }
    updateRecord=(e)=>{
        let _self = this;
        const timeLineId = e.data.payload.Record_Id__c;
        if(timeLineId){
            let activityTimeLine = _self.activityData.find(x => x.id === timeLineId);          
            if (!activityTimeLine) {
                _self.activityData = [];
                _self.callGetData();
                return;
            }
            if(this.enbleReload){
                this.isLoading = true;
                let queryStr = activityTimeLine.queryWrapper.queryStr;
                activityTimeLine.queryWrapper.queryStr = this.convertQueryStr(queryStr);
                const paramTimeLine =  {
                    recordId:_self.recordId,
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
                callQueryAndGetRecordBack(paramTimeLine).then(res=>{
                    let data = _self.buildDataWrapper(res);
                    if (!data || (data && data.length == 0)) {
                        return ;
                    }
                    const index = _self.activityData.findIndex(x => x.id == timeLineId);
                    const newActivityData = [..._self.activityData];
                    newActivityData[index] = data[0];
                    _self.activityData = newActivityData;
                    _self.isLoading = false;
                })
                this.enbleReload = false;
            }
        }
    }
    @track sortByDate= (arr)=>{
        arr.sort(function(a,b){
            return (typeof b.sortFieldData == 'undefined') - (typeof a.sortFieldData =='undefined')  
                || Number(new Date(b.sortFieldData)) - Number(new Date(a.sortFieldData));
        });
        return arr;
    }
    @track formatDate = (dt)=> {
            let y = dt.getFullYear();
            let m = ('00' + (dt.getMonth()+1)).slice(-2);
            let d = ('00' + dt.getDate()).slice(-2);
            let h = ('00'+ dt.getHours()).slice(-2);
            let mi = ('00'+ dt.getMinutes()).slice(-2);
        return (y + '/' + m + '/' + d+' '+h+":"+mi);
    }
    @track buildActionCallQuery=(querys, recordChildIds)=>{
            let _self = this;
            let actionTimeLines = [];
            querys.forEach(query => {
            const paramTimeLine =  {
                recordId : _self.recordId,
                recordChildIds,
                queryWrapper :{
                    queryStr : query.queryStr,
                    sortField : query.sortField,
                    detailFieldsDescribe : query.detailFieldsDescribe,
                    sortField : query.sortField,
                    subjectField : query.subjectField,
                    eventTypeField: query.eventTypeField
                }
            };
            actionTimeLines.push(callQueryAndGetRecordBack(paramTimeLine));
        });
        return actionTimeLines;
    }
    @track convertQueryStr = (queryStr)=> {
            if (queryStr.indexOf(':recordId)') != -1) {
                const condition = ':recordId) AND Id = :timeLineId ';
                queryStr =  queryStr.replace(':recordId)', condition);
            } else if (queryStr.indexOf(':recordId') != -1) {
                const condition = ':recordId AND Id = :timeLineId ';
                queryStr =  queryStr.replace(':recordId', condition);
            }
        return queryStr;
    }
    @track buildDataDetailFieldsDescribe=(detailFieldsDescribe, record) =>{
        return detailFieldsDescribe.map(item => {
            const apiName = item.apiName;
            const value = record[apiName] || '';
            item.value = value;
            if(item.type == 'REFERENCE') {
                const relationshipDisplayField = item.relationshipDisplayField;
                item.relationTo = record[relationshipDisplayField.split('.')[0]];
            }
            if(item.type="DATETIME"){
                if(item.value){
                    console.log("time: "+item.value);
                    const date = new Date(item.value);
                    item.value = this.formatDate(date);
                }
            }
            return item;
        })
    }
    @track buildDataWrapper =(data)=>{
        console.log('build data wrapp');
        let timeLinses = [];
        data.forEach(item => {
            const subjectApiName = item.queryWrapper.subjectField;
            const record = JSON.parse(item.recordJson);
            const eventTypeField = item.queryWrapper.eventTypeField;
            const detailFieldsDescribe =  item.queryWrapper.detailFieldsDescribe;
            const type = record[eventTypeField] || 'OTHER';
            const icon = this.icons.find(x=>x.DeveloperName == type);
            const timelineItem = {
                id : item.recordId,
                subject : record[subjectApiName] || '',
                type : type.toLowerCase(),
                createDate :item.sortFieldData ? this.formatDate(new Date(item.sortFieldData)): "No due date",
                iconName : icon? icon.Icon_name__c : 'standard:default',
                classTimeLine: this.getClassTimeLineByType(type),
                detailFieldsDescribe: this.buildDataDetailFieldsDescribe(detailFieldsDescribe, record),
                queryWrapper:item.queryWrapper
            };
            timeLinses.push(timelineItem);
        });
        return timeLinses;
    }
    @track getDataTimeLine=(actionTimeLines)=>{
        let _self = this;
        Promise.all(actionTimeLines)
        .then(res=>{
            let activityTimeLines = [];
            res.forEach(activityTimeLine=>{
                
                if (activityTimeLine && activityTimeLine.length >0 ) {
                    activityTimeLines.push(...activityTimeLine);
                }
            });
            if(activityTimeLines.length<=_self.perPage){
                _self.isCanLoadMore = false;
            }
            console.log('activityTimeLines:'+JSON.stringify(activityTimeLines));
            activityTimeLines = _self.sortByDate(activityTimeLines).slice(0,_self.perPage);
            const dataTimeLineNew = _self.buildDataWrapper(activityTimeLines, _self.icons);
            // console.log('data:'+JSON.stringify(dataTimeLineNew));
            _self.activityData = [...this.activityData,...dataTimeLineNew];
            _self.isLoading = false;
        })
    }
    
    @track toggleDetail=(e)=>{
        const recordId = e.currentTarget.getAttribute('data-id');
        const ele = this.template.querySelector(`[data-id="${recordId}"]`);
        ele.classList.toggle('slds-is-open');
    }
    @track showOptions=(e)=>{
        const classList = [...e.target.lastElementChild.classList];

        if(!classList.includes('active')){
            this.template.querySelectorAll('.edit-remove-btn-model').forEach(ele=>{
                ele.classList.remove('active');
            })
        }
        e.target.lastElementChild.classList.toggle('active');
    }
    navigateToActivityRecord = (e)=>{
        e.preventDefault();
        const recordId = e.target.getAttribute('data-id');
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes:{
                recordId,
                actionName: 'view'
            }
        })
    }
    @track edit = (e)=>{
        let recordId = e.target.getAttribute('data-id');
        this.changRecordId= recordId;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                actionName: 'edit',
            },
        })
        this.enbleReload = true;
        e.target.parentElement.classList.remove('active');
   }  
    @track remove = (e)=>{
        this.isShowRemoveConfirm = true;
        e.target.parentElement.classList.remove('active');
        const recordId = e.target.getAttribute('data-id');
        this.deleteId = recordId;
    }
    @track handleConFirmToRemove=(e)=>{
        const confirm = e.target.name;
        if(confirm == "confirm"){
            deleteActivityTimeLine({recordId:this.deleteId});
            this.isShowRemoveConfirm = false;
            refresh
            // this.activityData = [];
            // this.callGetData();
            refreshApex(this.activityData);
        }else{
            this.isShowRemoveConfirm=false;
        }
    }
    @track loadMore =()=>{
        let _self = this;
        const recordChildIds = _self.activityData.map(item=>item.id);
        let params = {
            objName: _self.objectApiName,
            perPage:_self.perPage,
            recordChildIds,
            sortOrder:this.sortOrder
        }
        initData(params).then(querys=>{
            _self.isLoading = true;
            let actionTimeLines = _self.buildActionCallQuery(querys,recordChildIds);
            _self.getDataTimeLine(actionTimeLines);
        })
    }
    disconnectedCallback() {
        unsubscribe(this.subscription, () => {
            // console.log('Unsubscribed Channel');
        });
    }
}