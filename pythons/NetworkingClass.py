import traceback
from Dbg import Dbg as d
import socket   
 
import json

import os,subprocess
from subprocess import check_output
import netifaces as ni


class NetworkingClass():
    debugLevel = 'AC'
    dbg = d(debugLevel)
   
    max_seconds=10
    tbef_default = 10
    taft_default=  30
    
    
    
    
    ni.ifaddresses('wlan0')
    #ip = ni.ifaddresses('eth0')[ni.AF_INET][0]['addr']
     # should print "192.168.100.37"
    
   
  
    def getLocalIp(self):
        
        try:
            eth0Ip=check_output(['hostname', '-I']) #works
           # print "Wlan0=" + eth0Ip.split()[1] 
           
            
            return eth0Ip
        except:
                  #  self.dbg.exc(str(traceback.format_exc()),'NetworkingClass:getLocalIp')
                    return "0.0.0.0"   
    def getWlanIp(self):
        
        try:
            eth0Ip=check_output(['hostname', '-I']) #works
            #print "Wlan0=" + eth0Ip.split()[1]
            #prev version had 25.10 check
            if("26.10" in eth0Ip ):
                ips=eth0Ip.split()[2]
            else:
                ips=eth0Ip.split()[1]
                 
           
            ips=eth0Ip.split()[0] 
            
            return ips
        except:
                 #   self.dbg.exc(str(traceback.format_exc()),'NetworkingClass:getLocalIp')
                    
                    return "0.0.0.0" 
        
    
    def getmac(self,interface='wlan0'):
        strmac="00:00:00:00:00:00"
        try:
            strmac=    open('/sys/class/net/wlan0/address').read()
        except:
        #    self.dbg.exc(str(traceback.format_exc()),'NetworkingClass.mac')
            return 'ff:ff:ff:ff:ff:ff'
            
       # self.dbg.say("mac=  " + str(strmac),'NetworkingClass.getmac')
            
        return strmac
        
