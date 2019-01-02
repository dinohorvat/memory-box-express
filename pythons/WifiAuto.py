from JSonClass import JSonClass
from NetworkingClass import NetworkingClass
import time
import os
#this script has to run as sudo only. 

####if wifi ip is 0.0.0.0  then start polling server , otherwise continue


configw_path="/etc/wpa_supplicant/wpa_supplicant.conf"
configw_template="/etc/wpa_supplicant/wpa_template"
conf_str = open(configw_template, 'r').read()

#err conf_str="country=GB \n ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev \n update_config=1 \n "
#conf_str=conf_str + "network={  \n  ssid=\"xssid\"  \n  psk=\"{pass}\"\n}"


print ("Conf str = " + conf_str)

def setWifi():
    #open file , replace text {ssid} and {pass}
    #call reboot.
    pass

if __name__ == '__main__':
    j=JSonClass()
    n= NetworkingClass()
    mac=  n.getmac()
    i=0
    
    
    while(i<=1):
        try:
            
            wlanIp =  n.getWlanIp().replace(":", "-").strip()
            mac =mac.replace(":", "-").strip()
            
            print ("Wlan ip is " + wlanIp)
            
            if(wlanIp=="0.0.0.0"):
                print ("Ip is ok, no action needed.")
                pass
            else:
            
                time.sleep(3)
                
                
                
                url="http://67.227.156.25/memorybox/read.php?serial=" + mac  + "&wlan0=" + wlanIp
                
                print (url)
                
                dicts= dict()
                
                dicts["action"] = "save"
                
                res =  (j.sendPost(url, dicts))
                
                
                if('ssid' in res):
                    #ssid arrived
                    print ('SSID arrived, update file and reboot')
                    wr = open(configw_path, 'w')
                    print ("Setting ssid " + res["ssid"])
                    w_text= conf_str.replace("xssid", res["ssid"])
                    w_text= w_text.replace("{pass}", res['passwd'])
                    print (w_text)
                    wr.write(w_text)
                    wr.close()
                    print ("System going for reboot ")
                    cmd = 'reboot'
                    print ('skip reboot ??? ')
                    time.sleep(2)
                    #cmd_result = os.system(cmd)
                else:
                    print ("no ssid ")
                
                
                
                #write latest time to file to know background forever is working .
                
                print ("Break for testing")
            i=i+1
            
        except Exception as e: print(e)
            
           
        
     
