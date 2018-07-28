# -*- coding:utf-8 -*-
import zipfile
import os
import configparser
import shutil

DEPLOY_DIR='../deploy' #npm実行場所（src）からの相対パス
BUILD_FILE_PREFIX='skill'
BUILD_FILE_NAME=os.path.join(DEPLOY_DIR,BUILD_FILE_PREFIX+'.zip')
TARGET_SOURCE_DIR='./'

config = configparser.ConfigParser()
config.read(os.path.join(DEPLOY_DIR,'deploy.properties'))
exclude_patterns = []
try:
    exclude_patterns = config['setting']['exclude'].split(',')
except:
    print("not set exclude")


def writefile(targetdir,buildfile):
    for target in os.listdir(targetdir):
        if(target in exclude_patterns):
            continue
        else:
            filename = os.path.join(targetdir,target)
            buildfile.write(filename)
            if(os.path.isdir(filename)):
                writefile(filename,buildfile)

if os.path.exists(BUILD_FILE_NAME):
    os.remove(BUILD_FILE_NAME)

with zipfile.ZipFile(os.path.join(DEPLOY_DIR,BUILD_FILE_NAME),'w',zipfile.ZIP_DEFLATED) as buildfile:
    writefile(TARGET_SOURCE_DIR,buildfile)

aws_cmd = "aws lambda update-function-code --region " + \
            config['setting']['region'] +" --function-name " + \
            config['setting']['function'] + " --zip-file fileb://" + BUILD_FILE_NAME

os.system(aws_cmd)
