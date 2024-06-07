#!/bin/bash
set -x
set -e
STAGE_SRC_DIR="/var/www/html/quicknews-backend/"
chown -fR  www-data:www-data $STAGE_SRC_DIR/
chmod -fR 0777 $STAGE_SRC_DIR/

m_stage_deployment() {
    ##### changing the owner for the files
     chown -fR  www-data:www-data $STAGE_SRC_DIR/
    #####Coping secret files to api
    #echo ***************coping secure files.......**************************

}
m_prod_deployment() {
#   #### changing the owner for the files
     chown -fR  www-data:www-data $STAGE_SRC_DIR/company/httpdocs
#    #####Coping secret files to api
   # echo ***************coping secure files.......**************************

}
if [ "$DEPLOYMENT_GROUP_NAME" == "quicknews-backend-deploymentgroup" ]; then
    echo *************************************Running Deployment***********************************
    m_stage_deployment
fi
if [ "$DEPLOYMENT_GROUP_NAME" == "iidm-prod-store-deployment" ]; then
 ##   echo *************************************Running Deployment***********************************
    m_prod_deployment
fi
