import sys
import time

configw_path = "/etc/wpa_supplicant/wpa_supplicant.conf"
configw_template = "/etc/wpa_supplicant/wpa_template"
conf_str = open(configw_template, 'r').read()

wr = open(configw_path, 'w')
w_text = conf_str.replace("xssid", sys.argv[1])
w_text = w_text.replace("{pass}", sys.argv[2])
print(w_text)
wr.write(w_text)
wr.close()
print("System going for reboot ")
cmd = 'reboot'
print('skip reboot ??? ')
time.sleep(2)
# cmd_result = os.system(cmd)
