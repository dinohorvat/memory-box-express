#######################################################
# 
# JSonClass.py
# Python implementation of the Class JSonClass
# 
# Created on:      05-Dec-2017 1:28:17 PM
# Original author: elex
# 
#######################################################
import json
import urllib
import requests
from pprint import pprint
import sys
import traceback
from Dbg import Dbg as d
from httplib import HTTPResponse

class JSonClass():
    debugLevel ='JSonClass'
    dbg = d(debugLevel)
    def array_to_json(self,dictAr):
        print 'w'
        print json.dumps(dictAr)
        self.dbg.say('oks','JSonClass.array_to_json')
        pass

    def do_serialize(self,dictAr):
        try:
            return json.dumps(dictAr)
        except:
            self.dbg.exc(str(traceback.format_exc()),'JSonClass.do_serialize')
        

    def json_to_array(self,jsn):
        try:
            return json.loads(jsn)
            self.dbg.say('Json to array','JSonClass.json_to_array')
        except:
            self.dbg.exc(str(traceback.format_exc()),'JSonClass.json_to_array')

    def sendTmprLiveLog(self,url,data):
    #'''    'id_site',
    #'code',
    #'avg_temp_H',
    #'avg_temp_L',
    #''''$avg_temp_Ex',
    #'''
        return self.sendPost(url, data)
        
        
        pass
    
     
    
    def sendPost(self,url,dicts):
        try:
            self.dbg.say('sending post','JSonClass.sendPost')
            
            dataInput = self.do_serialize(dicts) 
           
            headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
            
            r = requests.post(url, data=dataInput, headers=headers)
            
            if(r.status_code<>200):
                print 'status code ' + (str(r.status_code)) 
            
         #   stj=str(r.content) 
            
           # self.dbg.say("Returned content is " + stj,'JSonClass.sendPost')
            
            
            print ("Json content is " + str(r.json))
            self.dbg.say(str(r.json()),'JSonClass.sendPost')
           
            try:
                ds=r.json()
                print 
                rt=json.loads(ds)
                print ("ssid = ")
                print (rt["ssid"])
                return rt
            except:
                return "-1"
                
            
            #print (ds)
           # self.dbg.say('machine=>>>>>' + str( ds['result']) ,'JSonClass.sendPost')
            
            
            
            
        except:
            print 'logging error'
            self.dbg.exc(str(traceback.format_exc()),'JSonClass.sendPost') 
            return False