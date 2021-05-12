trigger ClosedOpportunityTrigger on Opportunity (after insert, after update) {
    List<Task> taskList = new List<Task>();

    for(Opportunity op : Trigger.new){
        Task task = new Task(Subject = 'Follow Up Test Task',WhatId = op.Id);
        taskList.add(task);
    }
    upsert taskList;
}