import React, {Component} from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Image,
  Alert,
} from 'react-native';
import {connect} from 'react-redux';
// import ImagePicker from 'react-native-image-picker';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

import DBGrnReceiptDataHelper from '../DB/DBGrnReceiptDataHelper';
import DBPCStaticDataHelper from '../DB/DBPCStaticDataHelper';
import Spinner from 'react-native-loading-spinner-overlay';
import Utils from '../Utils/Utils';
// Add Actions - replace 'Your' with whatever your reducer is called :)
// import YourActions from '../Redux/YourRedux'
import {Container, Content, Picker} from 'native-base';
import {Images} from '../Themes';
// Styles
import styles from './Styles/GrnRejectReceiptStyle';
// For API
import API from '../Services/Api';
import FJSON from 'format-json';

class GrnRejectReceipt extends Component {
  api = {};
  photoURI: '';
  file_id: 0;
  receipt_id: '';
  data: FormData;

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      entityReceipt: props.navigation.state.params.entityReceipt,
      quantity: '',
      img: null,
      index: props.navigation.state.params.index,
      selectedRejectReason: '',
      selectedUsageType: '',
      selectedUsageTypeValue: 'na',
      selectedRejectReasonValue: 'na',
      comment: '',
    };
    console.log('PRINT index: ', this.state.index);
    this.api = API.create();
    this.getRejectReasons();
    this.getUsageTypes();
  }

  async getUsageTypes() {
    const usageTypes = await DBPCStaticDataHelper.getUsageTypes();
    this.setState({
      usageTypes: usageTypes,
    });

    if (usageTypes.length == 1) {
      this.setState({
        selectedUsageType: usageTypes[0],
      });
    }
  }
  static navigationOptions = ({navigation}) => {
    return {
      title: 'REJECT RECEIPTS',
      headerTintColor: 'red',
      headerTitleStyle: {color: 'black'},
      headerRight: (
        <TouchableOpacity onPress={navigation.getParam('submitRejectReceipt')}>
          <Text style={styles.menuButton}>SUBMIT</Text>
        </TouchableOpacity>
      ),
    };
  };

  // MARK: Api
  async getEnvVar() {
    const environment = await Utils.retrieveDataFromAsyncStorage('ENVIRONMENT');
    console.log('Environment Variable (API) ', environment);

    if (environment == 'SKAD3') {
      envURL =
        'https://skad3a1-skanskapaas.inoappsproducts.com/ords/inoapps_ec/';
      console.log('New ENV URL ', envURL);
      this.api = new API.create(envURL);
      console.log(this.api, 'LETS GOOOO');
    } else if (environment == 'SKAD2') {
      envURL =
        'https://skad2a1-skanskapaas.inoappsproducts.com/ords/inoapps_ec/';
      console.log('New ENV URL ', envURL);
      this.api = new API.create(envURL);
    } else if (environment == 'SKAD1') {
      envURL =
        'https://skad1a1-skanskapaas.inoappsproducts.com/ords/inoapps_ec/';
      console.log('New ENV URL ', envURL);
      this.api = new API.create(envURL);
    } else if (environment == 'SKAT1') {
      envURL =
        'https://skat1a1-skanskapaas.inoappsproducts.com/ords/inoapps_ec/';
      console.log('New ENV URL ', envURL);
      this.api = new API.create(envURL);
    } else if (environment == 'PTEST2') {
      envURL = 'https://ptest2a1-inoapps4.inoapps.com/ords/inoapps_ec/';
      console.log('New ENV URL ', envURL);
      this.api = new API.create(envURL);
    } else if (environment == 'PDEV1') {
      envURL = 'https://pdev1a1-inoapps4.inoapps.com/ords/inoapps_ec/';
      this.api = new API.create(envURL);
      console.log('New ENV URL RECEIPTS ', envURL);
    } else if (environment == 'PDEV2') {
      envURL = 'https://pdev2a1-inoapps4.inoapps.com/ords/inoapps_ec/';
      this.api = new API.create(envURL);
      console.log('New ENV URL RECEIPTS ', envURL);
    } else if (environment == 'PDEV1') {
      envURL = 'https://pdev1a1-inoapps4.inoapps.com/ords/inoapps_ec/';
      this.api = new API.create(envURL);
      console.log('New ENV URL RECEIPTS ', envURL);
    } else if (environment == 'PTEST1') {
      envURL = 'https://ptest1a1-inoapps4.inoapps.com/ords/inoapps_ec/';
      this.api = new API.create(envURL);
      console.log('New ENV URL RECEIPTS ', envURL);
    } else if (environment == 'PDEV3') {
      envURL = 'https://pdev3a1-inoapps4.inoapps.com/ords/inoapps_ec/';
      this.api = new API.create(envURL);
      console.log('New ENV URL RECEIPTS ', envURL);
    } else if (environment == 'PTEST3') {
      envURL = 'https://ptest3a1-inoapps4.inoapps.com/ords/inoapps_ec/';
      this.api = new API.create(envURL);
      console.log('New ENV URL RECEIPTS ', envURL);
    } else if (environment == 'PDEMO') {
      envURL = 'https://pdemo1a1-inoapps4.inoapps.com/ords/inoapps_ec/';
      this.api = new API.create(envURL);
      console.log('New ENV URL RECEIPTS ', envURL);
    } else if (environment == 'SKAD4') {
      envURL =
        'https://skad4a1-skanskapaas.inoappsproducts.com/ords/inoapps_ec/';
      this.api = new API.create(envURL);
      console.log('New ENV URL RECEIPTS ', envURL);
    } else if (environment == 'SKAD5') {
      envURL =
        'https://skad5a1-skanskapaas.inoappsproducts.com/ords/inoapps_ec/';
      this.api = new API.create(envURL);
      console.log('New ENV URL RECEIPTS ', envURL);
    } else if (environment == 'SKAP') {
      envURL =
        'https://skap1a1-skanskapaas.inoappsproducts.com/ords/inoapps_ec/';
      this.api = new API.create(envURL);
      console.log('New ENV URL RECEIPTS ', envURL);
    } else if (environment == 'GTDEV1') {
      envURL =
        'https://gtdev1a1-gallifordtrypaas.inoappsproducts.com/ords/inoapps_ec/';
      this.api = new API.create(envURL);
      console.log('New ENV URL RECEIPTS ', envURL);
    }
  }

  componentDidMount() {
    this.getEnvVar();

    this.props.navigation.setParams({
      submitRejectReceipt: this._submitRejectReceipt,
    });
    console.log('Component Did mount');
  }

  renderRejectReasonPicker() {
    var items = [];
    if (this.state.rejectReasons != null) {
      // items = this.state.rejectReasons.map((item, i) => (
      //   <Picker.Item key={i} label={item.value} value={i} />
      // ));
    }
    return (
      <></>
      // <Picker
      //   style={styles.picker}
      //   textStyle={styles.answer}
      //   mode="dropdown"
      //   selectedValue={this.state.selectedRejectReason}
      //   onValueChange={this.onRejectReasonChange.bind(this)}
      // >
      //   <Picker.Item key="na" label="-" value="na" />

      //   {items}
      // </Picker>
    );
  }

  async getRejectReasons() {
    const rejectReasons = 'REJECTED'; //await DBPCStaticDataHelper.getRejectReasons();
    this.setState({
      rejectReasons: rejectReasons,
    });

    if (rejectReasons.length == 1) {
      this.setState({
        selectedRejectReason: rejectReasons[0],
      });
    }
  }

  async saveRejectReceipt(comments, photoURL, quantity) {
    receipt = this.state.entityReceipt;

    var test = await DBGrnReceiptDataHelper.saveRejectReceipt(
      comments,
      receipt.deliver_tran_id,
      0.0,
      receipt.item_description,
      receipt.item_number,
      receipt.order_line_number,
      receipt.order_number,
      photoURL,
      parseFloat(quantity),
      receipt.receipt_num,
      receipt.receipt_tran_id,
      receipt.to_organization,
      'rejectReceipt',
      receipt.unit_of_measure,
    );

    this.receipt_id = test;
  }

  async updateRejectReceipt(id, file_id) {
    let dbRejectReceipt = await DBGrnReceiptDataHelper.updateRejectReceipt(
      id,
      file_id,
    );

    return dbRejectReceipt;
  }

  async deleteRejectReceipt(id) {
    await DBGrnReceiptDataHelper.deleteRejectReceipt(id);
  }

  async sendFile() {
    this.setState({isLoading: true});
    console.log('Image data', this.data);

    // await DBGrnReceiptDataHelper.updateReceiptStatus(
    //   this.state.entityReceipt.order_number,
    //   this.state.entityReceipt.order_line_number,
    //   this.state.entityReceipt.receipt_num,
    //   this.photoURI,
    //   // this.state.selectedRejectReason.value,
    //   this.state.comment,
    //   "pending",
    //   new Date(),
    //   this.state.quantity
    // );

    const username = await Utils.retrieveDataFromAsyncStorage('USER_NAME');
    const params = [username, 'testPhotoName', this.data];
    let result = await this.api['postPhoto'].apply(this, params);

    this.setState({isLoading: false});

    setTimeout(async () => {
      console.log('Response API ok:231 ', result.data);

      if (result.ok) {
        console.log('Response API ok:231 ', result.data);

        this.file_id = result.data.REQUEST_ID;
        //update file id to local
        // let updatedReceipt = await this.updateRejectReceipt(
        //   this.receipt_id,
        //   this.file_id
        // );
        let updatedReceipt = this.state.entityReceipt;

        //call change receipt API
        this.postRejectReceipt(
          updatedReceipt.order_number,
          updatedReceipt.order_line_number,
          // updatedReceipt.quantity,
          this.state.quantity,
          updatedReceipt.unit_of_measure,
          updatedReceipt.item_number,
          updatedReceipt.item_description,
          updatedReceipt.to_organization,
          // updatedReceipt.comments,
          this.state.comment,
          updatedReceipt.receipt_num,
          updatedReceipt.deliver_tran_id,
          updatedReceipt.receipt_tran_id,
          updatedReceipt.type,
          // updatedReceipt.file_id,
          result.data.REQUEST_ID,
          this.receipt_id,
        );
      } else {
        console.log(
          'Response API: failed',
          result.status + ' - ' + result.problem,
        );

        this.submitFailedAlert();
      }
    }, 100);
  }

  async postRejectReceipt(
    order_number,
    order_line_number,
    quantity,
    unit_of_measure,
    item_number,
    item_description,
    to_organization,
    comments,
    receipt_num,
    deliver_tran_id,
    receipt_tran_id,
    type,
    file_id,
    receipt_id,
  ) {
    this.setState({isLoading: true});

    const username = await Utils.retrieveDataFromAsyncStorage('USER_NAME');
    const response = await this.api.postRejectReceipt(
      username,
      order_number,
      order_line_number,
      quantity,
      unit_of_measure,
      item_number,
      item_description,
      to_organization,
      comments,
      receipt_num,
      deliver_tran_id,
      receipt_tran_id,
      type,
      file_id,
    );

    this.setState({isLoading: false});

    setTimeout(async () => {
      console.log('Response API ok: 322dwd', response);

      if (response.ok) {
        console.log('Response API ok: 322', response.data);

        // this.deleteRejectReceipt(receipt_id);
        // await DBGrnReceiptDataHelper.updateReceiptStatus(
        //   order_number,
        //   order_line_number,
        //   receipt_num,
        //   this.photoURI,
        //   // comments,
        //   this.state.comment,
        //   'processing',
        //   new Date(),
        //   quantity,
        // );

        Alert.alert(
          '',
          'Reject receipt successfully submitted!',
          [{text: 'OK', onPress: () => this.props.navigation.popToTop()}],
          {cancelable: false},
        );
      } else {
        console.log(
          'Response API: failed',
          response.status + ' - ' + response.problem,
        );

        //To Do : save receipt Data
        Alert.alert(
          '',
          'Unable to submit the reject receipt as there is no internet connection. The change order will be submitted when there is connection.',
          [{text: 'OK', onPress: () => this.props.navigation.popToTop()}],
          {cancelable: false},
        );
      }
    }, 100);
  }

  async postRejectReceiptWithoutPhoto(
    order_number,
    order_line_number,
    quantity,
    unit_of_measure,
    item_number,
    item_description,
    to_organization,
    comments,
    receipt_num,
    deliver_tran_id,
    receipt_tran_id,
    type,
    file_id,
    receipt_id,
  ) {
    // await DBGrnReceiptDataHelper.updateReceiptStatus(
    //   order_number,
    //   order_line_number,
    //   receipt_num,
    //   null,
    //   //comments
    //   // "REJECTED",
    //   this.state.comment,
    //   'pending',
    //   new Date(),
    //   quantity,
    // );

    this.setState({isLoading: true});

    const username = await Utils.retrieveDataFromAsyncStorage('USER_NAME');
    const response = await this.api.postRejectReceipt(
      username,
      order_number,
      order_line_number,
      quantity,
      unit_of_measure,
      item_number,
      item_description,
      to_organization,
      comments,
      receipt_num,
      deliver_tran_id,
      receipt_tran_id,
      type,
      file_id,
    );

    this.setState({isLoading: false});

    setTimeout(async () => {
      if (response.ok) {
        console.log('Response API ok: 405', response.data);

        // this.deleteRejectReceipt(receipt_id);
        // await DBGrnReceiptDataHelper.updateReceiptStatus(
        //   order_number,
        //   order_line_number,
        //   receipt_num,
        //   null,
        //   // comments,
        //   this.state.comment,
        //   'processing',
        //   new Date(),
        //   quantity,
        // );

        Alert.alert(
          '',
          'Reject receipt successfully submitted!',
          [{text: 'OK', onPress: () => this.props.navigation.popToTop()}],
          {cancelable: false},
        );
      } else {
        console.log(
          'Response API: failed',
          response.status + ' - ' + response.problem,
        );

        //To Do : save receipt Data
        this.submitFailedAlert();
      }
    }, 100);
  }

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
      console.log(res, 'User   image picker in rejwct');

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

  selectPhotoTapped() {
    const options = {
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      mediaType: 'photo',

      storageOptions: {
        skipBackup: true,
        cameraRoll: true,
        path: 'ReceiptsPhotos',
      },
    };
    console.log('selectPhotoTapped');

    ImagePicker.showImagePicker(
      options,
      response => {
        console.log('Response = ', response);

        if (response.didCancel) {
          console.log('User cancelled photo picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        } else {
          let source = {uri: response.uri};
          this.setState({
            img: source,
          });
          this.photoURI = source.uri;
          this.data = new FormData();
          this.data.append('photo', {
            uri: source,
            type: 'image/jpeg', // or photo.type
            name: 'testPhotoName',
          });
        }
      },
      err => {
        console.log('Error = ', JSON.stringify(err));
      },
    );
  }

  showAlertMessage(alertMessage) {
    Alert.alert('', alertMessage, [{text: 'OK'}], {cancelable: false});
  }

  _submitRejectReceipt = () => {
    console.log('Submit reject receipt');
    if (isNaN(this.state.quantity) || this.state.quantity == 0) {
      this.showAlertMessage('Please enter a valid quantity.');
    } else {
      if (this.state.quantity > this.state.entityReceipt.quantity) {
        this.showAlertMessage(
          'Entered amount cannot be higher than available quantity.',
        );
      } else {
        return this._submitRejectReceiptConfirmed();
        if (
          this.state.selectedRejectReason == '' ||
          this.state.selectedRejectReason == undefined ||
          this.state.selectedRejectReason == null
        ) {
          console.log('COMMENTS: ', this.state.selectedRejectReason);
          this.state.selectedRejectReason = 'REJECTED';
          // this.showAlertMessage("Please add a comment.");
          this._submitRejectReceiptConfirmed();
        } else {
          this._submitRejectReceiptConfirmed();
        }
      }
    }
  };

  submitFailedAlert() {
    Alert.alert(
      '',
      'Unable to reject the receipt as there is no internet connection. The receipt will be rejected when there is connection.',
      [{text: 'OK', onPress: () => this.props.navigation.popToTop()}],
      {cancelable: false},
    );
  }

  _submitRejectReceiptConfirmed() {
    Alert.alert(
      '',
      'Are you sure you want to reject this receipt?',
      [
        {text: 'Ok', onPress: this._submit},
        {text: 'Cancel', style: 'cancel'},
      ],
      {cancelable: false},
    );
  }

  _submit = () => {
    //save to local
    // this.saveRejectReceipt(
    //   this.state.selectedRejectReason.value,
    //   this.photoURI,
    //   this.state.quantity
    // );

    // this.saveRejectReceipt(
    //   this.state.comment,
    //   this.photoURI,
    //   this.state.quantity
    // );

    if (
      this.photoURI != undefined &&
      this.photoURI != '' &&
      this.photoURI != ''
    ) {
      console.log('Print Photo URL: ', this.photoURI);
      //send file API
      this.sendFile();
    } else {
      let receipt = this.state.entityReceipt;

      this.postRejectReceiptWithoutPhoto(
        receipt.order_number,
        receipt.order_line_number,
        this.state.quantity,
        receipt.unit_of_measure,
        receipt.item_number,
        receipt.item_description,
        receipt.to_organization,
        // (this.state.selectedRejectReason = "REJECTED"),
        this.state.comment,
        receipt.receipt_num,
        receipt.deliver_tran_id,
        receipt.receipt_tran_id,
        receipt.type,
        0,
        this.receipt_id,
      );
    }
  };

  onRejectReasonChange(value: string) {
    const selectedRejectReason = this.state.rejectReasons[value];
    this.setState({selectedRejectReason: selectedRejectReason});
  }

  renderUsageTypePicker() {
    var items = [];
    if (this.state.usageTypes != null) {
      // items = this.state.usageTypes.map((item, i) => (
      //   <Picker.Item key={i} label={item.type} value={i} />
      // ));
    }
    return (
      <></>
      // <Picker
      //   style={styles.picker}
      //   textStyle={styles.answer}
      //   mode="dropdown"
      //   selectedValue={this.state.selectedUsageValue}
      //   onValueChange={this.onUsageValueChange.bind(this)}
      // >
      //   <Picker.Item key="na" label="-" value="na" />

      //   {items}
      // </Picker>
    );
  }
  onUsageValueChange(value: string) {
    const selectedUsageType = this.state.usageTypes[value];
    this.setState({selectedUsageType: selectedUsageType});
  }
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Spinner visible={this.state.isLoading} />
        <View style={styles.mainContainer}>
          <View style={styles.lineWithBottomSpace} />
          <ScrollView>
            <KeyboardAvoidingView
              style={styles.mainContainer}
              behavior="position"
              enabled>
              <View style={styles.headerContainer}>
                <View style={styles.lineWithBottomSpace} />
                <View style={styles.greyInfoContainer}>
                  <Text style={styles.infoTextLeft}>Order No.</Text>
                  <Text style={styles.infoText}>
                    {this.state.entityReceipt.order_number}
                  </Text>
                </View>
                {/* <View style={styles.pinkInfoContainer}>
                  <Text style={styles.infoTextLeft}>Description</Text>
                  <Text style={styles.infoText}>
                    {this.state.entityReceipt.item_description}
                  </Text>
                </View> */}
                <View
                  style={{
                    padding: 10,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    backgroundColor: '#FCE8E7',
                    alignItems: 'center',
                  }}>
                  <Text style={[styles.infoTextLeft, {paddingLeft: 10}]}>
                    Description
                  </Text>
                  <Text
                    style={[
                      styles.infoText,
                      {width: 110, alignSelf: 'center'},
                    ]}>
                    {this.state.entityReceipt.item_description}
                  </Text>
                </View>
                <View style={styles.greyInfoContainer}>
                  <Text style={styles.infoTextLeft}>UOM</Text>
                  <Text style={styles.infoText}>
                    {this.state.entityReceipt.unit_of_measure}
                  </Text>
                </View>
                <View style={styles.lastPinkInfoContainer}>
                  <Text style={styles.infoTextLeft}>Quantity</Text>
                  <Text style={styles.infoText}>
                    {this.state.entityReceipt.quantity}
                  </Text>
                </View>
              </View>
              <View style={styles.lineWithBottomSpace} />
              <View style={styles.line} />
              <View style={styles.headerContainer}>
                <View style={styles.box}>
                  <View style={styles.boxView}>
                    <Text style={styles.question}>QUANTITY REJECTED</Text>
                    <TextInput
                      style={styles.quantityInput}
                      maxLength={7}
                      placeholder="0.0 "
                      keyboardType="numeric"
                      onChangeText={quantity => this.setState({quantity})}
                      value={this.state.quantity}
                    />
                  </View>
                </View>

                <View style={styles.textBox}>
                  <TextInput
                    style={styles.input}
                    placeholder="ADD COMMENTS"
                    onChangeText={comment => this.setState({comment})}
                    multiline={true}
                    marginTop={10}
                    maxLength={80}
                    marginBottom={15}
                    marginLeft={5}
                    fontSize={12}
                    underlineColorAndroid="transparent"
                  />
                </View>

                {/* <View style={styles.box}>
            <View style={styles.boxView}>
            <Text style={styles.question}>REASON FOR REJECTION *</Text>
                  <Container style={styles.pickerContainer}>
                    <Content>{this.renderRejectReasonPicker()}</Content>
                    </Container>
                    <Text style={styles.pickerAnswer} pointerEvents="none">
                        {this.state.selectedRejectReason != null ? this.state.selectedRejectReason.value : ""}
                      </Text>
                      <Image source={Images.redArrow} style={styles.arrow} />
                </View>
    </View>*/}
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
              this.imageGalleryLaunch();
              return;
              this.selectPhotoTapped();
            }}
            style={styles.buttonStyle}>
            <View>
              <Text style={styles.buttonText}>ADD PHOTO</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(GrnRejectReceipt);
