import React, {Component} from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
// import ImagePicker from 'react-native-image-picker';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Spinner from 'react-native-loading-spinner-overlay';
import {connect} from 'react-redux';
import API from '../../App/Services/Api';
// For API
import CreateReceiptsAPIHelper from '../APIHelper/CreateReceiptsAPIHelper';
import DBGrnPurchaseOrderDataHelper from '../DB/DBGrnPurchaseOrderDataHelper';
import CreateReceipt from '../Models/CreateReceipt';
import Utils from '../Utils/Utils';
// Add Actions - replace 'Your' with whatever your reducer is called :)
// import YourActions from '../Redux/YourRedux'
// Styles
import styles from './Styles/GrnReceiptDetailsStyle';

class GrnReceiptDetails extends Component {
  api = {};
  photoURI: '';
  file_id: 0;
  receipt_id: '';
  data: FormData;

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      entityPurchaseOrder: props.navigation.state.params.entityPurchaseOrder,
      comments: '',
      quantity: '',
      img: null,
      isChecked: true,
      index: props.navigation.state.params.index,
      // enVar: props.navigation.state.params.envUrl,
    };

    this.api = API.create(props.navigation.state.params.envUrl);

    console.log(
      'sending to api >>>>>>>>>.',
      props.navigation.state.params.envUrl,
    );
    console.log(
      'entity Purchase Order Receipt: ',
      this.state.entityPurchaseOrder,
    );
  }

  static navigationOptions = ({navigation}) => {
    return {
      title: 'RECEIPTS',
      headerTintColor: 'red',
      headerTitleStyle: {
        color: 'black',
      },
      headerRight: (
        <TouchableOpacity onPress={navigation.getParam('submitReceipt')}>
          <Text style={styles.menuButton}>SUBMIT</Text>
        </TouchableOpacity>
      ),
    };
  };

  componentDidMount() {
    // EnvironmentVar()
    // .then((res) => {
    //   console.log("getting ENV in orderDetails", res);
    //   // this.setState({
    //   //   envUrl: res,
    //   // });
    //   if(res !=""){
    //     API.create(res);
    //   }
    // })
    // .catch((err) => {
    //   console.log("IN error", err);
    // });

    this.props.navigation.setParams({submitReceipt: this._submitReceipt});

    if (
      this.state.entityPurchaseOrder.quantity_received != null ||
      this.state.entityPurchaseOrder.quantity_received != undefined ||
      this.state.entityPurchaseOrder.quantity_received != ''
    ) {
      if (
        this.state.entityPurchaseOrder.quantity_received &&
        this.state.entityPurchaseOrder.quantity_received != 0
      ) {
        this.setState({
          quantity: '' + this.state.entityPurchaseOrder.quantity_received,
        });
      } else {
        this.setState({
          quantity: '',
        });
      }
    }

    if (
      this.state.entityPurchaseOrder.comments != null ||
      this.state.entityPurchaseOrder.comments != undefined
    ) {
      this.setState({
        comments: this.state.entityPurchaseOrder.comments,
      });
    }

    if (
      this.state.entityPurchaseOrder.photoURL != null ||
      this.state.entityPurchaseOrder.photoURL != undefined
    ) {
      let source = {
        uri: this.state.entityPurchaseOrder.photoURL,
      };
      this.setState({
        img: source,
      });
    }
  }

  _submitReceiptConfirmed = () => {
    Alert.alert(
      '',
      'Are you sure you want to create this receipt?',
      [
        {text: 'Ok', onPress: this._submit},
        {text: 'Cancel', style: 'cancel'},
      ],
      {cancelable: false},
    );
  };

  _submitReceipt = () => {
    if (this.state.entityPurchaseOrder.submitStatus == 'processing') {
      Alert.alert('', 'This receipt has been submitted', [{text: 'Ok'}], {
        cancelable: false,
      });
    } else {
      console.log('Submit receipt');
      if (isNaN(this.state.quantity) || this.state.quantity == 0) {
        this.showAlertMessage('Please enter a valid quantity.');
      } else {
        if (
          this.state.quantity >
          this.state.entityPurchaseOrder.quantity_available_to_receive
        ) {
          this.showAlertMessage(
            'Entered amount cannot be higher than open quantity.',
          );
        } else {
          this._submitReceiptConfirmed();
        }
      }
    }
  };

  _submit = () => {
    //save to local
    // this.saveCreateReceipt(this.state.comments, this.photoURI, this.state.quantity)
    console.log(this.photoURI, 'this.photoURI');
    if (
      this.photoURI != '' &&
      this.photoURI != undefined &&
      this.photoURI != null
    ) {
      //send file API
      this.sendFile();
    } else {
      let receipt = this.state.entityPurchaseOrder;
      console.log('receipt organization>>>>>>>>>>>>>>1', receipt);

      console.log('receipt organization', receipt.to_organization);

      this.postCreateReceipt(
        receipt.order_number,
        receipt.order_line_number,
        parseFloat(this.state.quantity),
        receipt.unit_of_measure,
        receipt.to_organization_id,
        receipt.to_organization,
        this.state.comments,
        receipt.type,
        0,
        receipt.distribution_number,
      );
    }
  };

  async saveCreateReceipt(comments, photoURL, quantity) {
    purchaseOrder = this.state.entityPurchaseOrder;

    // Convert quantity string to number
    var quantityNum = parseFloat(quantity);

    var test = await DBGrnPurchaseOrderDataHelper.saveCreateReceipt(
      comments,
      purchaseOrder.item_description,
      true,
      0.0,
      '',
      purchaseOrder.quantity_available_to_receive,
      purchaseOrder.order_line_number,
      purchaseOrder.order_number,
      purchaseOrder.quantity_ordered,
      photoURL,
      quantityNum,
      'draft',
      new Date(),
      purchaseOrder.to_organization,
      purchaseOrder.to_organization_id,
      'createReceipt',
      purchaseOrder.unit_of_measure,
      purchaseOrder.distribution_number,
    );

    this.receipt_id = test;

    await DBGrnPurchaseOrderDataHelper.updatePOStatus(
      purchaseOrder.order_number,
      purchaseOrder.distribution_number,
      purchaseOrder.order_line_number,
      true,
      'pending',
      new Date(),
      quantity,
      quantity,
      comments,
      this.photoURI,
    );
  }

  async updateCreateReceiptFile(id, file_id) {
    let dbCreateReceipt =
      await DBGrnPurchaseOrderDataHelper.updateCreateReceiptFile(id, file_id);
    return dbCreateReceipt;
  }

  async postCreateReceipt(
    order_number,
    order_line_number,
    quantity,
    unit_of_measure,
    to_organization_id,
    to_organization,
    comments,
    type,
    file_id,
    distribution_number,
  ) {
    this.setState({isLoading: true});

    var receipt = new CreateReceipt(
      order_number,
      order_line_number,
      quantity,
      unit_of_measure,
      to_organization_id,
      to_organization,
      comments,
      type,
      file_id,
      distribution_number,
    );

    // console.log("Post Create Receipt 1", receipt);

    // await DBGrnPurchaseOrderDataHelper.updateCreateReceiptStatus(
    //   receipt.order_number,
    //   receipt.distribution_number,
    //   receipt.order_line_number,
    //   true,
    //   "pending",
    //   new Date(),
    //   receipt.quantity);

    // console.log("Post Create Receipt 2");

    const username = await Utils.retrieveDataFromAsyncStorage('USER_NAME');

    console.log('PRINT FINAL RECEIPT:', [receipt]);
    const response = await CreateReceiptsAPIHelper.postCreateReceipt(
      username,
      [receipt],
      this.props.navigation.state.params.envUrl,
    );

    this.setState({isLoading: false});

    setTimeout(() => {
      if (response.ok) {
        this.props.navigation.state.params.refreshStatus(
          'processing',
          this.state.index,
        );
        this.submitSuccessfulAlert();
        console.log('Response API ok: ', response.data);
      } else {
        this.props.navigation.state.params.refreshStatus(
          'pending',
          this.state.index,
        );
        this.submitFailedAlert();
        console.log(
          'Response API: failed',
          response.status + ' - ' + response.problem,
        );
      }
    }, 100);
  }

  nextReceipt = () => {
    if (isNaN(this.state.quantity) || this.state.quantity == 0) {
      this.showAlertMessage('Please enter a valid quantity.');
    } else {
      if (
        this.state.quantity >
        this.state.entityPurchaseOrder.quantity_available_to_receive
      ) {
        this.showAlertMessage(
          'Entered amount cannot be higher than open quantity.',
        );
      } else {
        console.log(this.state.quantity, 'this.state.quantity339');
        //save to local
        // this.saveCreateReceipt(this.state.comments, this.photoURI, this.state.quantity)
        this.props.navigation.state.params.returnData(
          this.state.isChecked,
          this.state.comments,
          this.photoURI,
          this.state.quantity,
          this.state.index,
          this.file_id,
        );
        this.props.navigation.pop();
      }
    }
  };

  submitSuccessfulAlert() {
    Alert.alert(
      'Successful',
      'Receipts successfully submitted.',
      [{text: 'OK', onPress: this.navigateBackToMyReceipts}],
      {cancelable: false},
    );
  }

  navigateBackToMyReceipts = async () => {
    this.props.navigation.pop();
  };

  submitFailedAlert() {
    Alert.alert(
      '',
      'Unable to create the receipts as there is no internet connection. The receipt will be created when there is connection.',
      [{text: 'OK', onPress: () => this.props.navigation.pop()}],
      {cancelable: false},
    );
  }

  showAlertMessage(alertMessage) {
    Alert.alert(
      '',
      alertMessage,
      [{text: 'Cancel', style: 'cancel'}, {text: 'OK'}],
      {cancelable: false},
    );
  }

  _doOpenOption = () => {
    Alert.alert(
      '',
      'Please Select',
      [
        {text: 'Camera', onPress: () => this.selectPhotoTapped()},
        {text: 'Gallery', onPress: () => this.imageGalleryLaunch()},
        {
          text: 'Cancel',
          onPress: () => console.log('err'),
          style: 'cancel',
        },
      ],
      {cancelable: true},
    );
  };

  //select image from camera
  selectPhotoTapped() {
    let options = {
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      maxWidth: 400,
      maxHeight: 400,
    };
    launchCamera(options, res => {
      console.log(res, 'ggeting while clicking pic');
      if (res.didCancel) {
        console.log('User cancelled image picker');
      } else if (res.error) {
        console.log('ImagePicker Error: ', res.error);
      } else {
        let source = {
          uri: res && res.assets && res.assets.length > 0 && res.assets[0].uri,
        };
        this.setState({
          img: source,
        });
        this.photoURI =
          res && res.assets && res.assets.length > 0 && res.assets[0].uri;
        this.data = new FormData();
        this.data.append('photo', {
          uri: res && res.assets && res.assets.length > 0 && res.assets[0].uri,
          type:
            res && res.assets && res.assets.length > 0 && res.assets[0].type, // or photo.type
          name: 'recieptpic',
        });
      }
    });
  }

  //select image from gallery
  imageGalleryLaunch = () => {
    let options = {
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      maxWidth: 400,
      maxHeight: 400,
    };

    launchImageLibrary(options, res => {
      console.log(res, 'User   image picker');

      if (res.didCancel) {
        console.log('User cancelled image picker');
      } else if (res.error) {
        console.log('ImagePicker Error: ', res.error);
      } else if (res.customButton) {
        console.log('User tapped custom button: ', res.customButton);
      } else {
        let source = {
          uri: res && res.assets && res.assets.length > 0 && res.assets[0].uri,
        };
        this.setState({
          img: source,
        });
        this.photoURI =
          res && res.assets && res.assets.length > 0 && res.assets[0].uri;
        this.data = new FormData();
        this.data.append('photo', {
          uri: res && res.assets && res.assets.length > 0 && res.assets[0].uri,
          type: 'image/jpeg', // or photo.type
          name: 'testPhotoName',
        });
      }
    });
  };

  async sendFile() {
    this.setState({isLoading: true});
    console.log('Image data', this.data);

    const username = await Utils.retrieveDataFromAsyncStorage('USER_NAME');
    const params = [username, 'testPhotoName', this.data];
    let result = await this.api['postPhoto'].apply(this, params);

    this.setState({isLoading: false});
    console.log(result,'Result of image Api>>>>>>');
    setTimeout(async () => {
      if (result.ok) {
        console.log('Response API ok: ', result.data);
        this.file_id = result.data.REQUEST_ID;

        console.log('updated file id : ', this.file_id);
        console.log('updated receipt_id : ', this.receipt_id);

        //update file id to local
        // let updatedReceipt = await this.updateCreateReceiptFile(this.receipt_id, this.file_id);
        // console.log("updated Receipt data: ", updatedReceipt)
        let updatedReceipt = this.state.entityPurchaseOrder;

        console.log('updated Receipt data:>>>>>>>>>>>1111 ', updatedReceipt);

        //call change receipt API
        this.postCreateReceipt(
          updatedReceipt.order_number,
          updatedReceipt.order_line_number,
          parseFloat(this.state.quantity),
          updatedReceipt.unit_of_measure,
          updatedReceipt.to_organization_id,
          updatedReceipt.to_organization,
          this.state.comments,
          updatedReceipt.type,
          this.file_id,
          updatedReceipt.distribution_number,
        );
      } else {
        this.props.navigation.state.params.refreshStatus(
          'pending',
          this.state.index,
        );
        alert(result.status + ' - ' + result.problem)
        // this.submitFailedAlert();
        console.log(
          'Response API: failed',
          result.status + ' - ' + result.problem,
        );
      }
    }, 100);
  }

  render() {
    const {entityPurchaseOrder} = this.state;
    // || this.state.entityPurchaseOrder.submitStatus == "pending"
    if (this.state.entityPurchaseOrder.submitStatus == 'processing') {
      return (
        <View style={styles.container}>
          <Spinner visible={this.state.isLoading} />

          <View style={styles.mainContainer}>
            <View style={styles.lineWithBottomSpace} />
            <ScrollView>
              <KeyboardAvoidingView
                style={styles.mainContainer}
                behavior="position"
                enabled="enabled">
                <View style={styles.headerContainer}>
                  <View style={styles.lineWithBottomSpace} />
                  <View style={styles.greyInfoContainer}>
                    <Text style={styles.infoTextLeft}>Order No.</Text>
                    <Text style={styles.infoText}>
                      {this.state.entityPurchaseOrder.order_number}
                    </Text>
                  </View>
                  <View style={styles.pinkInfoContainer}>
                    <Text style={styles.infoTextLeft}>Order Line No.</Text>
                    <Text style={styles.infoText}>
                      {this.state.entityPurchaseOrder.order_line_number}
                    </Text>
                  </View>
                  <View style={styles.greyInfoContainer}>
                    <Text style={styles.infoTextLeft}>Distribution No.</Text>
                    <Text style={styles.infoText}>
                      {this.state.entityPurchaseOrder.distribution_number}
                    </Text>
                  </View>
                  <View style={styles.pinkInfoContainer}>
                    <Text style={styles.infoTextLeft}>Item No.</Text>
                    <Text style={styles.infoText}>0000</Text>
                  </View>
                  <View style={styles.greyInfoContainer}>
                    <Text style={styles.infoTextLeft}>Description</Text>
                    <Text style={styles.infoText}>
                      {this.state.entityPurchaseOrder.item_description}
                    </Text>
                  </View>
                  <View style={styles.pinkInfoContainer}>
                    <Text style={styles.infoTextLeft}>UOM</Text>
                    <Text style={styles.infoText}>
                      {this.state.entityPurchaseOrder.unit_of_measure}
                    </Text>
                  </View>
                  <View style={styles.greyInfoContainer}>
                    <Text style={styles.infoTextLeft}>Ordered Quantity</Text>
                    <Text style={styles.infoText}>
                      {this.state.entityPurchaseOrder.quantity_ordered}
                    </Text>
                  </View>
                  <View style={styles.lastPinkInfoContainer}>
                    <Text style={styles.infoTextLeft}>Open Quantity</Text>
                    <Text style={styles.infoText}>
                      {this.state.entityPurchaseOrder
                        .quantity_available_to_receive -
                        this.state.entityPurchaseOrder.quantity_received}
                    </Text>
                  </View>
                </View>
                <View style={styles.lineWithBottomSpace} />
                <View style={styles.line} />
                <View style={styles.headerContainer}>
                  <View style={styles.box}>
                    <View style={styles.boxView}>
                      <Text style={styles.question}>QUANTITY *</Text>

                      <TextInput
                        style={styles.quantityInput}
                        maxLength={7}
                        placeholder="0.0"
                        keyboardType="numeric"
                        onChangeText={text => this.setState({quantity: text})}
                        value={this.state.quantity}
                        editable={false}
                        selectTextOnFocus={false}
                      />
                    </View>
                  </View>
                  <View style={styles.textBox}>
                    <TextInput
                      style={styles.input}
                      value={this.state.comments}
                      placeholder="ADD COMMENTS"
                      onChangeText={text => this.setState({comments: text})}
                      multiline={true}
                      editable={false}
                      selectTextOnFocus={false}
                      marginTop={10}
                      maxLength={80}
                      marginBottom={15}
                      marginLeft={5}
                      fontSize={12}
                      underlineColorAndroid="transparent"
                    />
                  </View>
                  <View style={styles.imageViewBox}>
                    <Image source={this.state.img} style={styles.imageView} />
                  </View>
                </View>
              </KeyboardAvoidingView>
            </ScrollView>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity disabled={true} style={styles.disableButtonStyle}>
              <View>
                <Text style={styles.buttonText}>ADD PHOTO</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity disabled={true} style={styles.disableButtonStyle}>
              <View>
                <Text style={styles.buttonText}>NEXT</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <Spinner visible={this.state.isLoading} />

          <View style={styles.mainContainer}>
            <View style={styles.lineWithBottomSpace} />
            <ScrollView>
              <KeyboardAvoidingView
                style={styles.mainContainer}
                behavior="position"
                enabled="enabled">
                <View style={styles.headerContainer}>
                  <View style={styles.lineWithBottomSpace} />
                  <View style={styles.greyInfoContainer}>
                    <Text style={styles.infoTextLeft}>Order No.</Text>
                    <Text style={styles.infoText}>
                      {this.state.entityPurchaseOrder.order_number}
                    </Text>
                  </View>
                  <View style={styles.pinkInfoContainer}>
                    <Text style={styles.infoTextLeft}>Order Line No.</Text>
                    <Text style={styles.infoText}>
                      {this.state.entityPurchaseOrder.order_line_number}
                    </Text>
                  </View>
                  <View style={styles.greyInfoContainer}>
                    <Text style={styles.infoTextLeft}>Distribution No.</Text>
                    <Text style={styles.infoText}>
                      {this.state.entityPurchaseOrder.distribution_number}
                    </Text>
                  </View>
                  <View style={styles.pinkInfoContainer}>
                    <Text style={styles.infoTextLeft}>Item No.</Text>
                    <Text style={styles.infoText}>
                      {entityPurchaseOrder.item_number}
                    </Text>
                  </View>
                  <View style={[styles.greyInfoContainer, {}]}>
                    <Text style={styles.infoTextLeft}>Description</Text>
                    <Text
                      style={[
                        styles.infoText,
                        {width: 200, textAlign: 'right'},
                      ]}>
                      {this.state.entityPurchaseOrder.item_description}
                    </Text>
                  </View>
                  <View style={styles.pinkInfoContainer}>
                    <Text style={styles.infoTextLeft}>UOM</Text>
                    <Text style={styles.infoText}>
                      {this.state.entityPurchaseOrder.unit_of_measure}
                    </Text>
                  </View>
                  <View style={styles.greyInfoContainer}>
                    <Text style={styles.infoTextLeft}>Ordered Quantity</Text>
                    <Text style={styles.infoText}>
                      {this.state.entityPurchaseOrder.quantity_ordered}
                    </Text>
                  </View>
                  <View style={styles.lastPinkInfoContainer}>
                    <Text style={styles.infoTextLeft}>Open Quantity</Text>
                    {/* <Text style={styles.infoText}>
                      {this.state.entityPurchaseOrder
                        .quantity_available_to_receive -
                        this.state.entityPurchaseOrder.quantity_received}
                    </Text> */}

                    {/* <Text style={styles.infoText}>
                      {this.state.entityPurchaseOrder.quantity_ordered -
                        this.state.entityPurchaseOrder
                          .quantity_available_to_receive}
                    </Text> */}
                    <Text style={styles.infoText}>
                      {
                        this.state.entityPurchaseOrder
                          .quantity_available_to_receive
                      }
                    </Text>
                  </View>
                </View>
                <View style={styles.lineWithBottomSpace} />
                <View style={styles.line} />
                <View style={styles.headerContainer}>
                  <View style={styles.box}>
                    <View style={styles.boxView}>
                      <Text style={styles.question}>QUANTITY *</Text>

                      <TextInput
                        style={styles.quantityInput}
                        maxLength={7}
                        placeholder="0.0"
                        keyboardType="numeric"
                        onChangeText={text => this.setState({quantity: text})}
                        value={this.state.quantity}
                      />
                    </View>
                  </View>
                  <View style={styles.textBox}>
                    <TextInput
                      style={styles.input}
                      value={this.state.comments}
                      placeholder="ADD COMMENTS"
                      onChangeText={text => this.setState({comments: text})}
                      multiline={true}
                      marginTop={10}
                      maxLength={80}
                      marginBottom={15}
                      marginLeft={5}
                      fontSize={12}
                      underlineColorAndroid="transparent"
                    />
                  </View>
                  <View style={styles.imageViewBox}>
                    <Image source={this.state.img} style={styles.imageView} />
                  </View>
                </View>
              </KeyboardAvoidingView>
            </ScrollView>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => {
                this._doOpenOption();
                // this.imageGalleryLaunch();
                return;
                this.selectPhotoTapped();
              }}
              style={styles.buttonStyle}>
              <View>
                <Text style={styles.buttonText}>ADD PHOTO</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                this.nextReceipt();
              }}
              style={styles.buttonStyle}>
              <View>
                <Text style={styles.buttonText}>NEXT</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  }
}

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(GrnReceiptDetails);
