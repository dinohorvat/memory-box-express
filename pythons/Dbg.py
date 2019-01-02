'''
Created on Dec 7, 2017

@author: elex
'''
from _ast import Param
import logging,datetime
import traceback
class Dbg(object):
    '''
    level
    '''
    level=0
    LOG_FILENAME = 'general2.log'
    logging.basicConfig(filename=LOG_FILENAME,level=logging.DEBUG)

    
    
    def __init__(self,lvl):
        self.level=lvl

    @staticmethod
    def say( msg,clsMethod,lineChar="" ):
        '''
        Constructor
        '''
        now = str(datetime.datetime.now())
        
        clsOnly = clsMethod.split(".")
        
        noLogArray=['methodSettings' ]#,'DS18b20.read_lower','DS18b20.read_upper','DS18b20.read_external']
        
        sprt= lineChar
       
        for i in range(1 , 70):
            sprt=sprt+ str(lineChar)
            
        print sprt
            
        print str(    str(msg) + "  Function=  " + str(clsMethod)  )
        
    def sayCls(self, msg,clsMethod,implemented='N'):
        '''
        Constructor
        '''
        now = str(datetime.datetime.now())
        
        clsOnly = clsMethod.split(".")
        
        noLogArray=['methodSettings', 'DS18b20.','MysqlPi.runQuery','MainClass.temprFlow','MysqlPi','UiSettings']#,'DS18b20.read_lower','DS18b20.read_upper','DS18b20.read_external']
       # print 'cls method' + str(clsMethod)
       # if(clsMethod in noLogArray   or(clsOnly[0] in noLogArray)):
            #print 'Disabled print for this class'
       #     return
        
        print str( str(now) + " " +   str(msg) + " >>>  >>> >>>  " + str(clsMethod)  )
        #logging.info(str(str(msg) + " >> " + str(clsMethod)))
        
        
    def exc(self,msg,clsMethod,implemented='N'):
        now = str(datetime.datetime.now())
        print str(str(now) + " " + str(msg) + " >> " + str(clsMethod) + " Status " + implemented)
        strexc=str(now + " " + msg + " >> " + str(clsMethod) + " Status " + implemented)
        logging.debug(strexc)
        f= open ("exceptions.html",'a')
        f.write(strexc)
        
        
    def logGeneral(self,data):
        try:
            f= open ("log.txt","a")
            f.write(data)
            f.close()
            
        except:
                    self.dbg.exc(str(traceback.format_exc()),'Dbg:logGeneral')
    
        