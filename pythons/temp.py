#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""FileTreeMaker.py: ..."""

__author__  = "rahul"
import pymysql
from PIL import Image
import cv2
import os,traceback,sys
import argparse
import time
from pathlib import Path
#ffmpeg -i input.mp4 -ss 00:00:04 -vframes 1 output.png
#ffmpy is also installed
#TODO: in thread create thumbnails
#from ffmpy import FFmpeg

# Print result
#ffmpeg -i input.mp4 -vf fps=1 out%d.png



class FileTreeMaker(object):
    save_path_thmb="/var/www/html/media/thumbs/"
    i=0
    connection = pymysql.connect(host='localhost',
                             user='avionkix_smart',
                             passwd='pass1234',
                             db='avionkix_smart')
    cursor = connection.cursor()
    cursor.execute("delete from media")
    connection.commit()
    
   #def mysqlConn(self):
        
    #    cursor.execute("delete from media")
    #    connection.commit()
        
        #formulas = cursor.fetchall()
        #for row in formulas:
         #   print 'row'
 #   def create_video_thumbs(self): #not tested yet ?
  #      #TODO: check filename is mp4, .mov proably wont work
   #     ff = FFmpeg(inputs={'test_make_vid_thumb.mp4': None}, outputs={"out%d.png": ['-vf', 'fps=1']})
    #    #ff.run()
     #   print ff.cmd

        
    def tracing(self,a): #error here 
         
        for item in os.listdir(a):
            if os.path.isfile(item):
                print self.i + item 
            else:
                print str(self.i) + item 
                self.i+=self.i
                self.tracing(item)
    
    def thumbs(self,mainJpeg,outPath):
        try:
            #outPath  is just filename now 
                if(('thumb' in mainJpeg)):
                    print('already a thumb')
                    return
                
                my_file = Path(self.save_path_thmb + outPath)
                thumbpth=self.save_path_thmb + outPath
                fnamex=os.path.basename(mainJpeg)
                
                    #return
                sqlq=""
                  
                    
                print ("Main jpeg= " + mainJpeg)
                #if(".avi" in  mainJpeg or ".mp4" in  mainJpeg or ".mov" in mainJpeg or ".3gp"  in mainJpeg or ".ts" or "webm"  in mainJpeg ):
                if( mainJpeg.lower().endswith(('.avi', '.mp4', '.mov','.3gp','.wmv'))):
                    
                    print 'media is Video----------------------------------------------------------'
                    
                    print ('insert ' + str(fnamex))
                    
                    sqlq="insert into media set actual_path='{}',thumb_path='{}'".format(mainJpeg,'videothumb.jpeg')
                    #
                    print (sqlq)
                else:
                    
                    if(  mainJpeg.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')) ):
                        #print 'media is Image XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
                        
                        im = Image.open(mainJpeg)
                        
                        im.thumbnail((142, 128), Image.ANTIALIAS)
                        
                        #print ("Outpath=" + str(outPath) )
                        #im.save(self.save_path_thmb + outPath, "JPEG")
                        
                        #to keep aspect ratio use this
                         
                        imcv = cv2.imread(mainJpeg)
        
                        height, width = imcv.shape[:2]
        
                        thumbnail2 = cv2.resize(imcv, (160, 160), interpolation = cv2.INTER_AREA)
                        
                        status = cv2.imwrite(self.save_path_thmb + outPath,thumbnail2)
                    
                        print ('insert ' + str(fnamex))
                        sqlq="insert into media set actual_path='{}',thumb_path='{}'".format(mainJpeg,outPath)
                        #
                        print (sqlq)
                    else:
                        #print 'Not a media file*************************************************************'
                        pass
                #self.cursor.execute('delete from media')
                #self.connection.commit()
                self.cursor.execute(sqlq)
                self.connection.commit()
                if my_file.is_file():
                    print ('file already exists')
                
    #         
                
            #    no aspect ration 
            #    
            #    img = cv2.imread('/home/img/python.png', cv2.IMREAD_UNCHANGED)
 #
    #            print('Original Dimensions : ',img.shape)
 #
#width = 350
#height = 450
#dim = (width, height)
 
# resize image
#resized = cv2.resize(img, dim, interpolation = cv2.INTER_AREA)
 
#print('Resized Dimensions : ',resized.shape)
 
                
    #             
                
        except IOError:
                print ("cannot create thumbnail for" )
                traceback.print_exc(file=sys.stdout)
        except:
            print ("Error")

    def _recurse(self, parent_path, file_list, prefix, output_buf, level):
        if len(file_list) == 0 \
            or (self.max_level != -1 and self.max_level <= level):
            return
        else:
            file_list.sort(key=lambda f: os.path.isfile(os.path.join(parent_path, f)))
            for idx, sub_path in enumerate(file_list):
                if any(exclude_name in sub_path for exclude_name in self.exn):
                    continue

                full_path = os.path.join(parent_path, sub_path)
                print ("-------------filename=" + str(sub_path))
                idc = "┣━"
                if idx == len(file_list) - 1:
                    idc = "┗━"
                    
                print (full_path)
                
                self.thumbs(full_path, sub_path + ".thumb.jpeg") #outpath is hardecoded to var www html media now 

                if os.path.isdir(full_path) and sub_path not in self.exf:
                    output_buf.append("%s%s[%s]" % (prefix, idc, sub_path))
                    if len(file_list) > 1 and idx != len(file_list) - 1:
                        tmp_prefix = prefix + "┃  "
                    else:
                        tmp_prefix = prefix + "    "
                    self._recurse(full_path, os.listdir(full_path), tmp_prefix, output_buf, level + 1)
                elif os.path.isfile(full_path):
                    output_buf.append("%s%s%s" % (prefix, idc, sub_path))

    def make(self, args):
        self.root = args.root
        self.exf = args.exclude_folder
        self.exn = args.exclude_name
        self.max_level = args.max_level

        print("root:%s" % self.root)

        buf = []
        path_parts = self.root.rsplit(os.path.sep, 1)
        buf.append("[%s]" % (path_parts[-1],))
        self._recurse(self.root, os.listdir(self.root), "", buf, 0)

        output_str = "\n".join(buf)
        if len(args.output) != 0:
            with open(args.output, 'w') as of:
                of.write(output_str)
        return output_str

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-r", "--root", help="root of file tree", default="/var/www/html")
    parser.add_argument("-o", "--output", help="output file name", default="")
    parser.add_argument("-xf", "--exclude_folder", nargs='*', help="exclude folder", default=[])
    parser.add_argument("-xn", "--exclude_name", nargs='*', help="exclude name", default=[])
    parser.add_argument("-m", "--max_level", help="max level",
                        type=int, default=-1)
    args = parser.parse_args()
    print(FileTreeMaker().make(args))
    #x=FileTreeMaker()
    #x.FileTreeMaker().make(args)
    
    