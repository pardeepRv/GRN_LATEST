import DB from "../DB/DB";
import Utils from "../Utils/Utils";

let DBGrnReceiptDataHelper = {

  async saveReceipts(receipts) {
debugger
    let dbReceipts = await this.getAllReceipts();
    DB.write(() =>{
      DB.delete(dbReceipts);
      })

    console.log("PRINT LOCAL RECEIPTS: ",dbReceipts);
      /*let dbReceipts = DB.objects("Receipt");*/
      if (dbReceipts != null) {

        for (let i = 0; i < dbReceipts.length; i++) {
        let dbReceipt = dbReceipts[i];
        var isLocalReceiptExistsInAPIData = false

          for (let i = 0; i < receipts.length; i++) {
            let receipt = receipts[i];

          if (dbReceipt.receipt_num == receipt.receipt_num) {
              isLocalReceiptExistsInAPIData = true

              DB.write(() => {
                dbReceipt.order_number = receipt.order_number,
                dbReceipt.order_line_number = receipt.order_line_number,
                dbReceipt.item_description = receipt.item_description,
                dbReceipt.unit_of_measure = receipt.unit_of_measure,
                dbReceipt.to_organization = receipt.to_organization,
                dbReceipt.deliver_tran_id = receipt.deliver_tran_id,
                dbReceipt.receive_tran_id = receipt.receive_tran_id
              });

              if (receipt.receipt_quantity != undefined){

                DB.write(() => {
                dbReceipt.receipt_quantity = receipt.receipt_quantity
                });
              };

              var newdate = new Date();
              var duration = (newdate - dbReceipt.submittedTime)

              if (dbReceipt.submitStatus == "processing" , (dbReceipt.quantity != receipt.quantity || duration > 300000)){

                DB.write(() => {
                  dbReceipt.submitStatus = "",
                  dbReceipt.submittedTime = null,
                  dbReceipt.changedQuantity = 0,
                  dbReceipt.quantity = receipt.quantity
                  /*recToUpdate.photoURL = "",
                  recToUpdate.comment = ""*/
                });
              }else if (dbReceipt.submitStatus == "pending") {
                  console.log("PENDING");
                /*do nothing*/
              }else {

                DB.write(() => {
                  dbReceipt.quantity = receipt.quantity
                });
                console.log("Db update quantity");
              }

              /* await this.updateLocalReceipts(receipt.order_number, receipt.order_line_number,
                receipt.receipt_num,receipt.item_description,receipt.unit_of_measure,
                receipt.quantity, receipt.to_organization, receipt.deliver_tran_id,
                receipt.receive_tran_id,receipt.receipt_quantity, receipt.photoURL,
                receipt.comment,receipt.submitStatus,receipt.changedQuantity,
                receipt.submittedTime);*/

          }
        };


        if (!isLocalReceiptExistsInAPIData){
          console.log("Not Exist in API");
          await this.deleteReceipt();

        };

      };
    }


  for (let i = 0; i < receipts.length; i++) {
    let receipt = receipts[i];

    var isReceiptExistsInLocalDB = false;

    for (let i = 0; i < dbReceipts.length; i++) {
      let dbReceipt = dbReceipts[i];
      if (dbReceipt.receipt_num == receipt.receipt_num) {
          isReceiptExistsInLocalDB = true;
      };
    };

    if (!isReceiptExistsInLocalDB){
        console.log("Not Local Data");
          DB.write(async() => {
            DB.create("Receipt", receipt);
        });
    }
  };
},

  async getReceipts() {
    let dbReceipts = DB.objects("Receipt").filtered(`TRUEPREDICATE SORT(order_number DESC, order_line_number DESC)`);

    return dbReceipts;
  },

  async getAllReceipts(){
    let dbReceipts = DB.objects("Receipt");

    return dbReceipts;
  },

  async saveChangeReceipt(comments,
    deliver_tran_id,
    file_id,
    item_description,
    item_number,
    order_line_number,
    order_number,
    photoURL,
    quantity,
    receipt_num,
    receive_tran_id,
    to_organization,
    type,
    unit_of_measure,
  distribution_number) {
    console.log("Hit DB save data");

     let id = Utils.guid()

    DB.write(() => {
      const changeReceipt = DB.objects("ChangeReceipt");

      DB.create("ChangeReceipt", {
        id: id,
        comments: comments,
        deliver_tran_id: deliver_tran_id,
        file_id: file_id,
        item_description: item_description,
        item_number: item_number,
        order_line_number: order_line_number,
        order_number: order_number,
        photoURL: photoURL,
        quantity: quantity,
        receipt_num: receipt_num,
        receive_tran_id: receive_tran_id,
        to_organization: to_organization,
        type: type,
        unit_of_measure: unit_of_measure,
        distribution_number:distribution_number,
      });
    });

    const dbChangeReceipt = DB.objects("ChangeReceipt");
    console.log("Db change receipt: ", dbChangeReceipt);
    return id;
  },

  async updateChangeReceipt(
    id,
    file_id) {
    console.log("Hit DB update data");

    let dbChangeReceipt = DB.objects("ChangeReceipt").filtered('id == $0', id);
    let receiptToUpdate = dbChangeReceipt[0];
    DB.write(() => {
        receiptToUpdate.file_id = file_id
    });
    console.log("Db update change receipt: ", dbChangeReceipt);
    return receiptToUpdate;
  },

  async deleteChangeReceipt(id) {
    console.log("Hit DB delete data");

    let dbChangeReceipts = DB.objects("ChangeReceipt").filtered('id == $0', id);
    if (dbChangeReceipts != null) {
      dbChangeReceipts.map((dbChangeReceipt) => {
        Utils.removeImage(dbChangeReceipt.photoURL)
      })

      DB.write(() => {
        DB.delete(dbChangeReceipts);
      });
    }
  },

  async saveRejectReceipt(comments,
    deliver_tran_id,
    file_id,
    item_description,
    item_number,
    order_line_number,
    order_number,
    photoURL,
    quantity,
    receipt_num,
    receive_tran_id,
    to_organization,
    type,
    unit_of_measure) {
    console.log("Hit DB save data");

    let id = Utils.guid()

    DB.write(() => {
      const rejectReceipt = DB.objects("RejectReceipt");

      DB.create("RejectReceipt", {
        id: id,
        comments: comments,
        deliver_tran_id: deliver_tran_id,
        file_id: file_id,
        item_description: item_description,
        item_number: item_number,
        order_line_number: order_line_number,
        order_number: order_number,
        photoURL: photoURL,
        quantity: quantity,
        receipt_num: receipt_num,
        receive_tran_id: receive_tran_id,
        to_organization: to_organization,
        type: type,
        unit_of_measure: unit_of_measure
      });
    });

    const dbRejectReceipt = DB.objects("RejectReceipt");
    console.log("Db reject receipt: ", dbRejectReceipt);
    return id;
  },

  async updateRejectReceipt(
    id,
    file_id) {
    console.log("Hit DB update data");

    let dbRejectReceipt = DB.objects("RejectReceipt").filtered('id == $0', id);
    let receiptToUpdate = dbRejectReceipt[0];
    DB.write(() => {
        receiptToUpdate.file_id = file_id
    });
    console.log("Db update reject receipt: ", dbRejectReceipt);
    return receiptToUpdate;
  },

  async deleteRejectReceipt(id) {
    console.log("Hit DB delete data");

    let dbRejectReceipts = DB.objects("RejectReceipt").filtered('id == $0', id);
    if (dbRejectReceipts != null) {
      dbRejectReceipts.map((dbRejectReceipt) => {
        Utils.removeImage(dbRejectReceipt.photoURL)
      })
        DB.write(() => {
          DB.delete(dbRejectReceipts);
        });
    }
  },

  async saveCreateReceipt(comments,
    desc,
    edited,
    file_id,
    item_no,
    open_quantity,
    order_line_number,
    order_number,
    ordered_quantity,
    photoURL,
    quantity,
    submittedStatus,
    submittedTime,
    to_organization,
    to_organization_id,
    type,
    unit_of_measure,
    distribution_number,) {
    console.log("Hit DB save data");

    DB.write(() => {
      const createReceipt = DB.objects("CreateReceipt");
      DB.create("CreateReceipt", {
        id:  Utils.guid(),
        comments: comments,
        desc: desc,
        edited: edited,
        file_id: file_id,
        item_no: item_no,
        open_quantity: open_quantity,
        order_line_number: order_line_number,
        order_number: order_number,
        ordered_quantity: ordered_quantity,
        photoURL: photoURL,
        quantity: quantity,
        submittedStatus: submittedStatus,
        submittedTime: submittedTime,
        to_organization: to_organization,
        to_organization_id: to_organization_id,
        type: type,
        unit_of_measure: unit_of_measure,
        distribution_number:distribution_number,
      });
    });

    const dbCreateReceipt = DB.objects("CreateReceipt");
    console.log("Db create receipt: ", dbCreateReceipt);
  },

  async getChangeReceipt() {
    const dbChangeReceipt = DB.objects("ChangeReceipt");
    console.log("Db change receipt: ", dbChangeReceipt);
    return dbChangeReceipt;
  },

  async getRejectReceipt() {
    const dbRejectReceipt = DB.objects("RejectReceipt");
    console.log("Db reject receipt: ", dbRejectReceipt);
    return dbRejectReceipt;
  },

  async getCreateReceipt() {
    const dbCreateReceipt = DB.objects("CreateReceipt");
    console.log("Db create receipt: ", dbCreateReceipt);
    return dbCreateReceipt;
  },

  async updateReceiptStatus(order_number, order_line_number, receipt_num,photoURL,
     comment, submitStatus,submittedTime, changedQuantity,) {

    var dbExistingReceipts = null;

    if (order_line_number && receipt_num) {
      var dbExistingReceipts = DB.objects("Receipt").filtered('order_number = $0 AND order_line_number == $1 AND receipt_num == $2', order_number, order_line_number, receipt_num);
    } else {
      var dbExistingReceipts = DB.objects("Receipt").filtered('order_number = $0',order_number);
    }

    let recToUpdate = dbExistingReceipts[0];
    console.log("PO to update ", recToUpdate);

    if (photoURL != null || photoURL != "" ) {

      DB.write(() => {

        console.log("Print comment", comment);
          recToUpdate.submitStatus = submitStatus,
          recToUpdate.submittedTime = submittedTime,
          recToUpdate.changedQuantity = parseFloat(changedQuantity),
          recToUpdate.comment = comment

      });
        console.log("Receipts updated without Photo");
    }
    else {

      DB.write(() => {
            recToUpdate.submitStatus = submitStatus,
            recToUpdate.submittedTime = submittedTime,
            recToUpdate.changedQuantity = parseFloat(changedQuantity),
            recToUpdate.comment = comment,
            recToUpdate.photoURL = photoURL
      });
      console.log("Rec updated withPhoto");
    };
    console.log("Db update Receipts! ", recToUpdate);
    return recToUpdate;
  },

  async updateLocalReceipts(order_number, order_line_number, receipt_num,
    item_description,unit_of_measure, quantity, to_organization, deliver_tran_id,
    receive_tran_id,receipt_quantity, photoURL,
     comment, submitStatus,changedQuantity,submittedTime) {

    console.log("Did enter update local receipts");

    var dbExistingReceipts = null;

    if (receipt_num) {
      var dbExistingReceipts = DB.objects("Receipt").filtered('receipt_num == $0',receipt_num);
    }

    let recToUpdate = dbExistingReceipts[0];
    console.log("Receipt to update ", recToUpdate);

      DB.write(() => {
        recToUpdate.order_number = order_number,
        recToUpdate.order_line_number = order_line_number,
        recToUpdate.item_description = item_description,
        recToUpdate.unit_of_measure = unit_of_measure,
        recToUpdate.to_organization = to_organization,
        recToUpdate.deliver_tran_id = deliver_tran_id,
        recToUpdate.receive_tran_id = receive_tran_id
      });

      if (receipt_quantity != undefined){
          console.log("Db update receipt quantity");
        DB.write(() => {
        recToUpdate.receipt_quantity = receipt_quantity
        });
      };
  console.log("PRINT DATE: ",recToUpdate.submittedTime, new Date());

      if (recToUpdate.submitStatus == "processing" && (recToUpdate.quantity != quantity )){
            console.log("PROCESSING");
            console.log("print local quantity: ", recToUpdate.quantity)
            console.log("print API quantity: ", quantity)
        DB.write(() => {


          recToUpdate.submitStatus = "",
          recToUpdate.submittedTime = new Date(),
          recToUpdate.changedQuantity = 0,
          recToUpdate.quantity = quantity
          /*recToUpdate.photoURL = "",
          recToUpdate.comment = ""*/
        });
      }else if (recToUpdate.submitStatus == "pending") {
          console.log("PENDING");
        /*do nothing*/
      }else {
        DB.write(() => {
          recToUpdate.quantity = quantity
        });
        console.log("Db update quantity");
      }

    console.log("Db update new Receipts! ", recToUpdate);
    return recToUpdate;

  },

  async deleteReceipt() {
    console.log("Hit DB delete data");
    let dbRejectReceipt = DB.objects("Receipt")
    if (dbRejectReceipt != null) {
        DB.write(() => {
          DB.delete(dbRejectReceipt);
        });
    }
  },


}

module.exports = DBGrnReceiptDataHelper;
