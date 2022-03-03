import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import NetInfo from '@react-native-community/netinfo';
import CheckBox from 'react-native-modest-checkbox';
import {connect} from 'react-redux';
import API from '../../App/Services/Api';
import CreateReceiptsAPIHelper from '../APIHelper/CreateReceiptsAPIHelper';
import EnvironmentVar from '../Config/EnvironmentVar';
import DBGrnPurchaseOrderDataHelper from '../DB/DBGrnPurchaseOrderDataHelper';
import {Images} from '../Themes';
import Utils from '../Utils/Utils';
// Add Actions - replace 'Your' with whatever your reducer is called :)
// import YourActions from '../Redux/YourRedux'
// Styles
import styles from './Styles/GrnPurchaseOrderDetailsStyle';

class GrnPurchaseOrderDetails extends Component {
  api = {};
  photoURL: '';
  file_id: 0;
  data: FormData;
  totalReceiptsToPost: 0;

  constructor(props) {
    super(props);
    this.state = {
      entityPurchaseOrder: props.navigation.state.params.entityPurchaseOrder,
      createReceipt: props.navigation.state.params.createReceipt,
      dataObjects: [],
      filteredOrderLines: [],
      createReceiptObjects: [],
      receiptsToPost: [],
      isLoading: false,
      isChecked: false,
      currentNoOfReceiptsToPost: 0,
      entireReceipts: [],
      totalCount: 0,
      envUrl: '',
      pressEntireRecipts: false,
    };

    this.file_idArr = [];
    this.api = API.create();
    console.log(this.state.entityPurchaseOrder, 'entityPurchaseOrder>>>');
    console.log(
      props.navigation.state.params.dataObjects,
      'in props dataObjects',
    );
  }

  static navigationOptions = ({navigation}) => {
    return {
      title: 'PURCHASE ORDER',
      headerTintColor: 'red',
      headerTitleStyle: {
        color: 'black',
      },
      headerRight: (
        <TouchableOpacity onPress={navigation.getParam('submitReceiptAlert')}>
          <Text style={styles.menuButton}>SUBMIT</Text>
        </TouchableOpacity>
      ),
    };
  };

  componentDidMount() {
    EnvironmentVar()
      .then(res => {
        console.log('getting ENV in orderDetails', res);
        this.setState({
          envUrl: res,
        });

        API.create(res);
      })
      .catch(err => {
        console.log('IN error', err);
      });

    this.props.navigation.setParams({
      submitReceiptAlert: this._submitReceiptAlert,
    });
    console.log('Component Did mount');
    this.getDBGrnPO();
    this.getCreateReceipts();
  }

  checkPoStatus() {
    var count = 0;
    for (let i = 0; i < this.state.filteredOrderLines.length; i++) {
      let entity = this.state.filteredOrderLines[i];
      if (
        entity.submitStatus != 'processing' &&
        entity.submitStatus != 'pending'
      ) {
        count += 1;
      }
    }

    console.log('Print Count:', count);
    this.setState({
      totalCount: count,
    });
  }

  async getDBGrnPO() {
    // Retrieve from DB

    this.props.navigation.state.params.dataObjects.map(orderLine => {
      if (
        orderLine.quantity_available_to_receive > 0 &&
        this.state.entityPurchaseOrder.order_number == orderLine.order_number
        // ||
        // this.state.entityPurchaseOrder.supplier_number == orderLine.supplier_number
      ) {
        this.state.filteredOrderLines.push(orderLine);
      }
    });

    this.setState({
      dataObjects: this.state.filteredOrderLines,
    });

    this.checkPoStatus();

    return;
    let dbPurchaseOrders =
      await DBGrnPurchaseOrderDataHelper.getPOByOrderNumber(
        this.state.entityPurchaseOrder.order_number,
      );
    console.log('DB rrrr: ', dbPurchaseOrders);

    dbPurchaseOrders.map(orderLine => {
      if (orderLine.quantity_available_to_receive > 0) {
        this.state.filteredOrderLines.push(orderLine);
      }
    });
    console.log('filteredOrderLines: ', this.state.filteredOrderLines);

    this.setState({
      dataObjects: this.state.filteredOrderLines,
    });

    this.checkPoStatus();
  }

  async getCreateReceipts() {
    // Retrieve from DB

    // let dbCreateReceipts = await DBGrnPurchaseOrderDataHelper.getCreateReceipts(
    //   this.state.entityPurchaseOrder.order_number,
    // );

    let dbCreateReceipts = this.state.dataObjects.filter((val, i) => {
      return val.order_number == this.state.entityPurchaseOrder.order_number;
    });
    console.log(
      'createReceipts retrieved from DB: need to check ',
      dbCreateReceipts,
      this.state.entityPurchaseOrder.order_number,
    );

    this.setState({
      createReceiptObjects: dbCreateReceipts,
    });
  }

  async returnData(edited, comments, photoURL, quantity, index, file_id) {
    console.log(
      edited,
      comments,
      photoURL,
      quantity,
      index,
      file_id,
      'edited, comments, photoURL, quantity, index',
      'file_id',
    );
    let updatedData = [...this.state.dataObjects];
    updatedData[index] = {
      ...updatedData[index],
      edited: edited,
      comments: comments,
      photoURL: photoURL,
      // quantity_received: parseInt(quantity),  //commented bcoz of client req
      quantity_received: quantity,
    };

    const username = await Utils.retrieveDataFromAsyncStorage('USER_NAME');
    this.api = API.create(this.state.envUrl);

    if (photoURL != undefined) {
      let formdata = new FormData();
      formdata.append('photo', {
        uri: photoURL,
        type: 'image/jpeg',
        name: 'testPhotoName',
      });

      const params = [username, 'testPhotoName', formdata];
      let result = await this.api['postPhoto'].apply(this, params);

      console.log('result of pic api in sending to frst screen ', result);

      if (result.ok) {
        console.log('Response API ok: ', result.data);
        updatedData.forEach((element, idx) => {
          if (element.edited && idx == index) {
            updatedData[idx].file_id = result.data.REQUEST_ID;
          }
        });
      }
    }
    console.log(updatedData, 'updatedDataupdatedData<><>');
    this.setState({
      dataObjects: updatedData,
      // createReceiptObjects: this.state.dataObjects,
      createReceiptObjects: updatedData,
    });
  }

  refreshStatus(submitStatus, index) {
    console.log(submitStatus, index, 'submitStatus, index');
    let updatedData = [...this.state.dataObjects];
    updatedData[index] = {...updatedData[index], submitStatus: submitStatus};
    console.log(updatedData, 'on refresh updatedData');

    this.setState({
      dataObjects: updatedData,
      // createReceiptObjects: this.state.dataObjects,
      createReceiptObjects: updatedData,
    });
  }

  submitAllCreateReceiptsAlert = async () => {
    Alert.alert(
      'Submit Receipts?',
      'Are you sure you want to submit the receipts for all the open purchase order lines? This will ignore any selected lines or draft receipts created previously.',
      [
        {text: 'Cancel', style: ''},
        {text: 'OK', onPress: this.submitAllCreateReceipts.bind(this)},
      ],
      {cancelable: false},
    );
  };

  submitAllCreateReceipts = async () => {
    this.setState({
      pressEntireRecipts: true,
    });
    await this.getCreateReceipts();
    await this.saveCreateAllReceipt();
    await this.submitReceipt();
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
      'Unable to create the receipts(s) as there is no internet connection. The receipt(s) will be submitted when there is connection.',
      [{text: 'OK', onPress: this.refreshData}],
      {cancelable: false},
    );
  }

  refreshData = async () => {
    this.getDBGrnPO();
  };

  _submitReceiptAlert = () => {
    console.log(
      this.state.createReceiptObjects,
      'this.state.createReceiptObjects on click submit>>>>>>>>.',
    );

    if (this.state.createReceiptObjects.length > 0) {
      for (
        let index = 0;
        index < this.state.createReceiptObjects.length;
        index++
      ) {
        const element = this.state.createReceiptObjects[index];

        if (element && element.edited) {
          return Alert.alert(
            'Submit Receipts?',
            'Are you sure you want to submit the receipts for all the selected purchase order lines?',
            [
              {text: 'Cancel', style: ''},
              // {text: 'OK', onPress: this.submitReceipt.bind(this)},
              {text: 'OK', onPress: this.submitSelectedReceiptOnly.bind(this)},
            ],
            {cancelable: false},
          );
        }

        if (element && element.submitStatus == 'processing') {
          return Alert.alert(
            '',
            'Please create at least one receipt to submit.',
            [{text: 'OK'}],
            {cancelable: false},
          );
        }
      }
    } else {
      Alert.alert(
        '',
        'Please create at least one receipt to submit.',
        [{text: 'OK'}],
        {cancelable: false},
      );
    }
  };

  // for selected receipts only>>>>>>>>>>.
  submitSelectedReceiptOnly = () => {
    debugger;
    // this.setState({isLoading: true});

    this.getCreateReceipts();
    console.log(
      'Print Create submitSelectedReceiptOnly:',
      this.state.createReceiptObjects,
    );

    if (this.state.createReceiptObjects != null) {
      for (let i = 0; i < this.state.createReceiptObjects.length; i++) {
        let entity = this.state.createReceiptObjects[i];

        if (entity && entity.edited) {
          if (entity.photoURL != null && entity.photoURL != '') {
            console.log('PRINT PHOTOURL: ', entity.photoURL);
            let source = {
              uri: entity.photoURL,
            };
            this.photoURL = entity.photoURL;
            this.data = new FormData();
            this.data.append('photo', {
              uri: entity.photoURL,
              type: 'image/jpeg', // or photo.type
              name: 'testPhotoName',
            });

            // API.create(this.state.envUrl);
            //send file API : upload image

            //commenting code bcoz we are using it prior

            // this.uploadImage(entity.id, i);
          } else {
            // this.state.currentNoOfReceiptsToPost++;
            // this.counterToCallCreateReceiptsAPI(
            //   this.state.currentNoOfReceiptsToPost,
            //   this.state.createReceiptObjects.length,
            // );
          }
        }
      }
      this.state.currentNoOfReceiptsToPost++;
      this.counterToCallCreateReceiptsAPI(
        this.state.currentNoOfReceiptsToPost,
        this.state.createReceiptObjects.length,
      );
    } else {
      console.log('No Create Receipt in DB');
    }
  };

  submitReceipt = () => {
    this.setState({isLoading: true});

    this.getCreateReceipts();
    console.log('Print Create Receipts: ', this.state.createReceiptObjects);

    if (this.state.createReceiptObjects != null) {
      for (let i = 0; i < this.state.createReceiptObjects.length; i++) {
        let entity = this.state.createReceiptObjects[i];

        if (entity.photoURL != null && entity.photoURL != '') {
          console.log('PRINT PHOTOURL: ', entity.photoURL);
          let source = {
            uri: entity.photoURL,
          };
          this.photoURL = entity.photoURL;
          this.data = new FormData();
          this.data.append('photo', {
            uri: entity.photoURL,
            type: 'image/jpeg', // or photo.type
            name: 'testPhotoName',
          });

          // API.create(this.state.envUrl);
          //send file API : upload image
          // this.uploadImage(entity.id,entity);
          this.uploadImagesEntire();
        } else {
          // this.state.currentNoOfReceiptsToPost++;
          // this.counterToCallCreateReceiptsAPI(
          //   this.state.currentNoOfReceiptsToPost,
          //   this.state.createReceiptObjects.length,
          // );
        }
      }
      this.state.currentNoOfReceiptsToPost++;
      this.counterToCallCreateReceiptsAPI(
        this.state.currentNoOfReceiptsToPost,
        this.state.createReceiptObjects.length,
      );
    } else {
      console.log('No Create Receipt in DB');
    }
  };

  async updateCreateReceiptFile(id, file_id) {
    let dbCreateReceipt =
      await DBGrnPurchaseOrderDataHelper.updateCreateReceiptFile(id, file_id);
    return dbCreateReceipt;
  }

  // for submit selected items
  async postCreateSelectedReceipt() {
    console.log(
      'Selected items Api hit',
      this.state.createReceiptObjects.length,
    );

    this.setState({isLoading: false});

    let updatedArr = [];

    for (let i = 0; i < this.state.createReceiptObjects.length; i++) {
      if (this.state.createReceiptObjects[i].edited) {
        this.state.createReceiptObjects[i].quantity =
          this.state.createReceiptObjects[i].quantity_received;
        updatedArr.push(this.state.createReceiptObjects[i]);
      }
    }

    console.log('updated Receipts To Post updatedArr', updatedArr);

    const username = await Utils.retrieveDataFromAsyncStorage('USER_NAME');

    const response = await CreateReceiptsAPIHelper.postCreateReceipt(
      username,
      updatedArr,
      this.state.envUrl,
    );

    this.setState({isLoading: false});

    setTimeout(() => {
      if (response.ok) {
        console.log('Print Receipts', updatedArr);
        console.log('Response API ok: ', response.data);
        this.submitSuccessfulAlert();
        // alert('Receipts successfully submitted.');
      } else {
        console.log(
          'Response API: failed',
          response.status + ' - ' + response.problem,
        );
        this.submitFailedAlert();
        if (
          updatedArr &&
          updatedArr.length > 0 &&
          response.problem == 'NETWORK_ERROR'
        ) {
          this.savingMultilineArrInAsyncstorage(updatedArr);
        }
      }
    }, 100);
  }

  //save arr to local storage as multiline line

  savingMultilineArrInAsyncstorage = async arr => {
    console.log(arr, 'saving to savingMultilineArrInAsyncstorage');
    try {
      await AsyncStorage.setItem('SAVE_MULTILINE_PO', JSON.stringify(arr));
    } catch (error) {
      console.log(error, 'err saving in local');
    }
  };

  async postCreateReceipt() {
    debugger;

    console.log(
      'Did Enter Post Create Receipt ',
      this.state.createReceiptObjects.length,
    );
    this.setState({isLoading: true});

    for (let i = 0; i < this.state.createReceiptObjects.length; i++) {
      if (
        // this.state.createReceiptObjects[i].quantity &&
        // this.state.createReceiptObjects[i].quantity != null &&
        this.state.createReceiptObjects[i].quantity_received
      ) {
        this.state.createReceiptObjects[i].quantity =
          this.state.createReceiptObjects[i].quantity_received;
      } else {
        this.state.createReceiptObjects[i].quantity =
          this.state.createReceiptObjects[i].quantity_available_to_receive;
      }
      // let entity = this.state.createReceiptObjects[i];

      // console.log(entity.order_line_number, entity.distribution_number);
      // await DBGrnPurchaseOrderDataHelper.updateCreateReceiptStatus(
      //   entity.order_number,
      //   entity.distribution_number,
      //   entity.order_line_number,
      //   true,
      //   'pending',
      //   new Date(),
      //   entity.quantity,
      // );
    }

    console.log('updated Receipts To Post', this.state.createReceiptObjects);

    const username = await Utils.retrieveDataFromAsyncStorage('USER_NAME');
    const response = await CreateReceiptsAPIHelper.postCreateReceipt(
      username,
      this.state.createReceiptObjects,
      this.state.envUrl,
    );

    this.setState({isLoading: false});
    console.log(response, 'response receive entire receipt API');
    setTimeout(() => {
      if (response.ok) {
        console.log('Print Receipts', this.state.createReceiptObjects);
        console.log('Response API ok: ', response.data);
        this.submitSuccessfulAlert();
        this.setState({
          pressEntireRecipts: false,
        });
      } else {
        console.log(
          'Response API: failed',
          response.status + ' - ' + response.problem,
        );

        this.submitFailedAlert();

        if (
          this.state.createReceiptObjects &&
          this.state.createReceiptObjects.length > 0 &&
          response.problem == 'NETWORK_ERROR'
        ) {
          this.savingArrInAsyncstorage(this.state.createReceiptObjects);
        }
      }
    }, 100);
  }

  //save arr to local storage as entire po

  savingArrInAsyncstorage = async arr => {
    console.log(arr, 'saving to storage');
    try {
      await AsyncStorage.setItem('SAVE_ENTIRE_PO', JSON.stringify(arr));
    } catch (error) {
      console.log(error, 'err saving in local');
    }
  };

  async counterToCallCreateReceiptsAPI(
    currentNoOfReceiptsToPost,
    totalReceiptsToPost,
  ) {
    debugger;
    console.log(
      'currentNoOfReceiptsToPost totalReceiptsToPost',
      currentNoOfReceiptsToPost,
      totalReceiptsToPost,
    );

    // if (currentNoOfReceiptsToPost == totalReceiptsToPost) {
    //   this.postCreateReceipt();
    // }
    if (this.state.pressEntireRecipts) {
      this.postCreateReceipt();
    } else {
      this.postCreateSelectedReceipt();
    }
  }

  async uploadImage(entityID, idx) {
    this.setState({isLoading: true});
    console.log('Image data', this.data);
    const username = await Utils.retrieveDataFromAsyncStorage('USER_NAME');
    this.api = API.create(this.state.envUrl);

    const params = [username, 'testPhotoName', this.data];
    let result = await this.api['postPhoto'].apply(this, params);

    this.setState({isLoading: false});
    setTimeout(async () => {
      console.log('result of pic api ', result);

      if (result.ok) {
        console.log('Response API ok: ', result.data);
        this.file_id = result.data.REQUEST_ID;
        console.log(this.file_id, 'this.file_id in me>>>');
        console.log('API Response:', entityID, this.data, this.photoURL);

        //update file id to local
        // await this.updateCreateReceiptFile(entityID, this.file_id);

        // for (let i = 0; i < this.state.createReceiptObjects.length; i++) {
        //   if (this.state.createReceiptObjects[i].edited && i == idx) {
        //     this.state.createReceiptObjects[i].file_id_new =
        //       result.data.REQUEST_ID;
        //   }
        // }

        // this.state.createReceiptObjects.forEach((element, index) => {
        //   if (element.edited && index == idx) {
        //     this.state.createReceiptObjects[index].file_id_new =
        //       result.data.REQUEST_ID;
        //   }
        // });

        return;
        this.state.currentNoOfReceiptsToPost++;
        this.counterToCallCreateReceiptsAPI(
          this.state.currentNoOfReceiptsToPost,
          this.state.createReceiptObjects.length,
        );
      } else {
        console.log(
          'Response API: failed',
          result.status + ' - ' + result.problem,
        );
      }
    }, 100);
  }

  async uploadImagesEntire() {
    console.log(this.state.createReceiptObjects, '............id and index');

    this.setState({isLoading: true});
    console.log('Image data', this.data);
    const username = await Utils.retrieveDataFromAsyncStorage('USER_NAME');
    this.api = API.create(this.state.envUrl);

    const params = [username, 'testPhotoName', this.data];
    let result = await this.api['postPhoto'].apply(this, params);

    this.setState({isLoading: false});
    setTimeout(async () => {
      console.log('result of pic api ', result);

      if (result.ok) {
        console.log('Response API ok: ', result.data);
        this.file_id = result.data.REQUEST_ID;
        console.log('API Response:', this.data, this.photoURL);

        return;
        this.state.currentNoOfReceiptsToPost++;
        this.counterToCallCreateReceiptsAPI(
          this.state.currentNoOfReceiptsToPost,
          this.state.createReceiptObjects.length,
        );
      } else {
        console.log(
          'Response API: failed',
          result.status + ' - ' + result.problem,
        );
      }
    }, 100);
  }

  async saveCreateAllReceipt() {
    let purchaseOrder = this.state.entityPurchaseOrder;

    // Loop through all the lines and create CreateReceipts
    await this.state.dataObjects.map(async item => {
      if (item.submitStatus != 'processing' && item.submitStatus != 'pending') {
        this.state.entireReceipts.push(item);
      }
    });

    console.log(this.state.entireReceipts, 'saariya receiptss');

    if (this.state.entireReceipts.length > 0) {
      await this.state.entireReceipts.map(async item => {
        console.log('Submite Status: ', item.submitStatus);

        // Convert quantity string to number
        var quantityNum = parseFloat(item.quantity_available_to_receive);

        return;
        var test = await DBGrnPurchaseOrderDataHelper.saveCreateReceipt(
          '',
          item.item_description,
          true,
          0.0,
          '',
          item.quantity_available_to_receive,
          item.order_line_number,
          item.order_number,
          item.quantity_ordered,
          '',
          item.quantity_available_to_receive,
          'draft',
          new Date(),
          item.to_organization,
          item.to_organization_id,
          'createReceipt',
          item.unit_of_measure,
          item.distribution_number,
        );

        DBGrnPurchaseOrderDataHelper.updatePOStatus(
          item.order_number,
          item.distribution_number,
          item.order_line_number,
          true,
          'pending',
          new Date(),
          item.quantity_available_to_receive,
          item.quantity_available_to_receive,
          '',
          '',
        );
      });
    } else {
      Alert.alert(
        '',
        'No purchase order lines available for receiving.',
        [{text: 'OK'}],
        {cancelable: false},
      );
    }
  }

  //get single line data from local storage
  gettingArrFromAsyncstorage = async () => {
    try {
      this.setState({isLoading: true});
      const signleLinePo = await AsyncStorage.getItem('SAVE_SINGLE_LINE_PO');

      if (signleLinePo !== null) {
        console.log(JSON.parse(signleLinePo), 'signleLinePo my arr is....');
        let saveArr = JSON.parse(signleLinePo);
        console.log(saveArr[0], 'wefwefwef');
        NetInfo.fetch().then(async state => {
          console.log('Connection type', state.type);
          console.log('Is connected?', state.isConnected);
          if (state && state.isConnected && saveArr.length > 0) {
            const username = await Utils.retrieveDataFromAsyncStorage(
              'USER_NAME',
            );
            const response = await CreateReceiptsAPIHelper.postCreateReceipt(
              username,
              saveArr,
              this.state.envUrl,
            );

            this.setState({isLoading: false});
            console.log(response, 'Res from create receipt api>>>');
            setTimeout(async () => {
              if (response && response.ok) {
                console.log('Response API ok: ', response.data);
                this.submitSuccessfulAlert();
                await AsyncStorage.removeItem('SAVE_SINGLE_LINE_PO');
                this.setState({isLoading: false});
              } else {
                console.log(
                  'Response API: failed',
                  response.status + ' - ' + response.problem,
                );
                alert(response.status + ' - ' + response.problem);
                this.setState({isLoading: false});
              }
            }, 100);
          } else {
            alert('Please check your internet connection.');
            this.setState({isLoading: false});
          }
        });
      } else {
        alert('All data has been synced.');
        this.setState({isLoading: false});
      }
    } catch (error) {
      // Error retrieving data
      console.log(error, 'err getting saving in local');
    }
  };

  /************************************************************
   * STEP 1
   * This is an array of objects with the properties you desire
   * Usually this should come from Redux mapStateToProps
   *************************************************************/

  /* ***********************************************************
    * STEP 2
    * `renderRow` function. How each cell/row should be rendered
    * It's our best practice to place a single component here:
    *
    * e.g.
      return <MyCustomCell title={item.title} description={item.description} />
    *************************************************************/
  renderRow = ({item, index}) => {
    if (!item.edited) {
      if (item.submitStatus == 'processing') {
        return (
          <TouchableHighlight
            onPress={() => {
              this.props.navigation.navigate('GrnReceiptDetails', {
                entityPurchaseOrder: item,
                index: index,
                returnData: this.returnData.bind(this),
                refreshStatus: this.refreshStatus.bind(this),
                envUrl: this.state.envUrl,
              });
            }}>
            <View>
              <View style={styles.row}>
                <View style={styles.rowSection1Processing}>
                  <CheckBox
                    checkboxStyle={styles.checkboxDisabled}
                    checked={item.edited}
                    label={''}
                  />
                </View>
                <View style={styles.rowSection2}>
                  <Text style={styles.rowLabel}>{item.item_number}</Text>
                </View>
                <View style={styles.rowSection3}>
                  <Text style={styles.rowLabel}>{item.item_description}</Text>
                </View>
                <View style={styles.rowSection4}>
                  <Text style={styles.rowLabel}>
                    {item.distribution_number}
                  </Text>
                </View>
                {/* <View style={styles.rowSection5}>
                  <Text style={styles.rowLabel}>{item.delivery_date}</Text>
                </View> */}
                <View style={[styles.rowSection5, {padding: 5}]}>
                  <Text style={[{fontSize: 8, fontWeight: 'bold'}]}>
                    {item.delivery_date}
                  </Text>
                </View>
                <View style={styles.rowSection6}>
                  <Image
                    source={Images.rightArrow}
                    style={styles.rightArrow}
                    resizeMode="center"
                  />
                </View>
              </View>
              <View style={styles.speratorline} />
            </View>
          </TouchableHighlight>
        );
      } else if (item.submitStatus == 'pending') {
        return (
          <TouchableHighlight
            onPress={() => {
              this.props.navigation.navigate('GrnReceiptDetails', {
                entityPurchaseOrder: item,
                index: index,
                returnData: this.returnData.bind(this),
                refreshStatus: this.refreshStatus.bind(this),
                envUrl: this.state.envUrl,
              });
            }}>
            <View>
              <View style={styles.row}>
                <View style={styles.rowSection1Pending}>
                  <CheckBox
                    checkboxStyle={styles.checkboxDisabled}
                    checked={item.edited}
                    label={''}
                  />
                </View>
                <View style={styles.rowSection2}>
                  <Text style={styles.rowLabel}>{item.item_number}</Text>
                </View>
                <View style={styles.rowSection3}>
                  <Text style={styles.rowLabel}>{item.item_description}</Text>
                </View>
                <View style={styles.rowSection4}>
                  <Text style={styles.rowLabel}>
                    {item.distribution_number}
                  </Text>
                </View>
                <View style={styles.rowSection5}>
                  <Text style={styles.rowLabel}>{item.delivery_date}</Text>
                </View>
                <View style={styles.rowSection6}>
                  <Image
                    source={Images.rightArrow}
                    style={styles.rightArrow}
                    resizeMode="center"
                  />
                </View>
              </View>
              <View style={styles.speratorline} />
            </View>
          </TouchableHighlight>
        );
      } else {
        return (
          <TouchableHighlight
            onPress={() => {
              this.props.navigation.navigate('GrnReceiptDetails', {
                entityPurchaseOrder: item,
                index: index,
                returnData: this.returnData.bind(this),
                refreshStatus: this.refreshStatus.bind(this),
                envUrl: this.state.envUrl,
              });
            }}>
            <View>
              <View style={styles.row}>
                <View style={styles.rowSection1}>
                  <CheckBox
                    checkboxStyle={styles.checkboxDisabled}
                    checked={item.edited}
                    label={''}
                  />
                </View>
                <View style={styles.rowSection2}>
                  <Text style={styles.rowLabel}>{item.item_number}</Text>
                </View>
                <View style={styles.rowSection3}>
                  <Text style={styles.rowLabel}>{item.item_description}</Text>
                </View>
                <View style={styles.rowSection4}>
                  <Text style={styles.rowLabel}>
                    {item.distribution_number}
                  </Text>
                </View>
                <View style={[styles.rowSection5, {padding: 5}]}>
                  <Text style={[{fontSize: 8, fontWeight: 'bold'}]}>
                    {item.delivery_date}
                  </Text>
                </View>
                <View style={styles.rowSection6}>
                  <Image
                    source={Images.rightArrow}
                    style={styles.rightArrow}
                    resizeMode="center"
                  />
                </View>
              </View>
              <View style={styles.speratorline} />
            </View>
          </TouchableHighlight>
        );
      }
    } else {
      if (item.submitStatus == 'processing') {
        return (
          <TouchableHighlight
            onPress={() => {
              this.props.navigation.navigate('GrnReceiptDetails', {
                entityPurchaseOrder: item,
                index: index,
                returnData: this.returnData.bind(this),
                refreshStatus: this.refreshStatus.bind(this),
                envUrl: this.state.envUrl,
              });
            }}>
            <View>
              <View style={styles.rowProcessing}>
                <View style={styles.rowSection1Processing}>
                  <CheckBox
                    checkboxStyle={styles.checkbox}
                    checked={item.edited}
                    label={''}
                  />
                </View>
                <View style={styles.rowSection2}>
                  <Text style={styles.rowLabel}>{item.item_number}</Text>
                </View>
                <View style={styles.rowSection3}>
                  <Text style={styles.rowLabel}>{item.item_description}</Text>
                </View>
                <View style={styles.rowSection4}>
                  <Text style={styles.rowLabel}>
                    {item.distribution_number}
                  </Text>
                </View>
                {/* <View style={styles.rowSection5}>
                  <Text style={styles.rowLabel}>{item.delivery_date}</Text>
                </View> */}
                <View style={[styles.rowSection5, {padding: 5}]}>
                  <Text style={[{fontSize: 8, fontWeight: 'bold'}]}>
                    {item.delivery_date}
                  </Text>
                </View>
                <View style={styles.rowSection6}>
                  <Image
                    source={Images.rightArrow}
                    style={styles.rightArrow}
                    resizeMode="center"
                  />
                </View>
              </View>
              <View style={styles.speratorline} />
            </View>
          </TouchableHighlight>
        );
      } else if (item.submitStatus == 'pending') {
        return (
          <TouchableHighlight
            onPress={() => {
              this.props.navigation.navigate('GrnReceiptDetails', {
                entityPurchaseOrder: item,
                index: index,
                returnData: this.returnData.bind(this),
                refreshStatus: this.refreshStatus.bind(this),
                envUrl: this.state.envUrl,
              });
            }}>
            <View>
              <View style={styles.row}>
                <View style={styles.rowSection1Pending}>
                  <CheckBox
                    checkboxStyle={styles.checkbox}
                    checked={item.edited}
                    label={''}
                  />
                </View>
                <View style={styles.rowSection2}>
                  <Text style={styles.rowLabel}>{item.item_number}</Text>
                </View>
                <View style={styles.rowSection3}>
                  <Text style={styles.rowLabel}>{item.item_description}</Text>
                </View>
                <View style={styles.rowSection4}>
                  <Text style={styles.rowLabel}>
                    {item.distribution_number}
                  </Text>
                </View>
                {/* <View style={styles.rowSection5}>
                  <Text style={styles.rowLabel}>{item.delivery_date}</Text>
                </View> */}
                <View style={[styles.rowSection5, {padding: 5}]}>
                  <Text style={[{fontSize: 8, fontWeight: 'bold'}]}>
                    {item.delivery_date}
                  </Text>
                </View>
                <View style={styles.rowSection6}>
                  <Image
                    source={Images.rightArrow}
                    style={styles.rightArrow}
                    resizeMode="center"
                  />
                </View>
              </View>
              <View style={styles.speratorline} />
            </View>
          </TouchableHighlight>
        );
      } else {
        return (
          <TouchableHighlight
            onPress={() => {
              this.props.navigation.navigate('GrnReceiptDetails', {
                entityPurchaseOrder: item,
                index: index,
                returnData: this.returnData.bind(this),
                refreshStatus: this.refreshStatus.bind(this),
                envUrl: this.state.envUrl,
              });
            }}>
            <View>
              <View style={styles.row}>
                <View style={styles.rowSection1}>
                  <CheckBox
                    checkboxStyle={styles.checkbox}
                    checked={item.edited}
                    label={''}
                  />
                </View>
                <View style={styles.rowSection2}>
                  <Text style={styles.rowLabel}>{item.item_number}</Text>
                </View>
                <View style={styles.rowSection3}>
                  <Text style={styles.rowLabel}>{item.item_description}</Text>
                </View>
                <View style={styles.rowSection4}>
                  <Text style={styles.rowLabel}>
                    {item.distribution_number}
                  </Text>
                </View>
                <View style={[styles.rowSection5, {padding: 5}]}>
                  <Text style={[{fontSize: 8, fontWeight: 'bold'}]}>
                    {item.delivery_date}
                  </Text>
                </View>
                <View style={styles.rowSection6}>
                  <Image
                    source={Images.rightArrow}
                    style={styles.rightArrow}
                    resizeMode="center"
                  />
                </View>
              </View>
              <View style={styles.speratorline} />
            </View>
          </TouchableHighlight>
        );
      }
    }
  };

  /************************************************************
   * STEP 3
   * Consider the configurations we've set below.  Customize them
   * to your liking!  Each with some friendly advice.
   *************************************************************/

  // The default function if no Key is provided is index
  // an identifiable key is important if you plan on
  // item reordering.  Otherwise index is fine
  keyExtractor = (item, index) => index;

  // How many items should be kept im memory as we scroll?
  oneScreensWorth = 20;

  // extraData is for anything that is not indicated in data
  // for instance, if you kept "favorites" in `this.state.favs`
  // pass that in, so changes in favorites will cause a re-render
  // and your renderItem will have access to change depending on state
  // e.g. `extraData`={this.state.favs}

  // Optimize your list if the height of each item can be calculated
  // by supplying a constant height, there is no need to measure each
  // item after it renders.  This can save significant time for lists
  // of a size 100+
  // e.g. itemLayout={(data, index) => (
  //   {length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index}
  // )}

  render() {
    if (this.state.totalCount > 0) {
      return (
        <View style={styles.container}>
          <Spinner visible={this.state.isLoading} />

          <ScrollView style={styles.mainContainer}>
            <View style={styles.mainContainer}>
              <View style={styles.lineWithBottomSpace} />
              <View style={styles.line} />

              {/* <TouchableOpacity onPress={this.gettingArrFromAsyncstorage}>
                <Text style={[styles.titleStyle, {alignSelf: 'flex-end'}]}>
                  Sync
                </Text>
              </TouchableOpacity> */}

              <View style={styles.headerContainer}>
                <Text style={styles.titleStyle}>PURCHASE ORDER HEADER</Text>
                <View style={styles.shortLine} />
                <View style={styles.greyInfoContainer}>
                  <Text style={styles.infoTextLeft}>Order No.</Text>
                  <Text style={styles.infoText}>
                    {this.state.entityPurchaseOrder.order_number}
                  </Text>
                </View>
                <View style={styles.pinkInfoContainer}>
                  <Text style={styles.infoTextLeft}>Supplier Name</Text>
                  <Text style={styles.infoText}>
                    {this.state.entityPurchaseOrder.supplier_name}
                  </Text>
                </View>
                <View style={styles.lastGreyInfoContainer}>
                  <Text style={styles.infoTextLeft}>Supplier No.</Text>
                  <Text style={styles.infoText}>
                    {this.state.entityPurchaseOrder.supplier_number}
                  </Text>
                </View>
              </View>
              <View style={styles.lineWithBottomSpace} />
              <View style={styles.line} />
              <View style={styles.buttonView}>
                <TouchableOpacity
                  onPress={this.submitAllCreateReceiptsAlert.bind(this)}
                  style={styles.submitAllCreateReceiptsButton}>
                  <View>
                    <Text style={styles.submitAllCreateReceiptsButtonText}>
                      RECEIVE ENTIRE PO
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.bottomContainer}>
                <Text style={styles.titleStyle}>PURCHASE ORDER LINES</Text>
                <View style={styles.shortLine} />
                <View style={styles.tableContainer}>
                  <View style={styles.header}>
                    <View style={styles.headerSection1}>
                      <Text style={styles.headerLabel} />
                    </View>
                    <View style={styles.headerSection2}>
                      <Text style={styles.headerLabel}>Item No.</Text>
                    </View>
                    <View style={styles.headerSection3}>
                      <Text style={styles.headerLabel}>Item Description</Text>
                    </View>
                    <View style={styles.headerSection4}>
                      <Text style={styles.headerLabel}>Dist No.</Text>
                    </View>
                    <View style={styles.headerSection5}>
                      <Text style={styles.headerLabel}>
                        Requested Delivery Date
                      </Text>
                    </View>
                  </View>
                  <View style={styles.line} />

                  <FlatList
                    contentContainerStyle={styles.listContent}
                    data={this.state.dataObjects}
                    renderItem={this.renderRow}
                    keyExtractor={this.keyExtractor}
                    initialNumToRender={this.oneScreensWorth}
                    ListHeaderComponent={this.renderHeader}
                    ListFooterComponent={this.renderFooter}
                    ListEmptyComponent={this.renderEmpty}
                    ItemSeparatorComponent={this.renderSeparator}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <Spinner visible={this.state.isLoading} />

          <ScrollView style={styles.mainContainer}>
            <View style={styles.mainContainer}>
              <View style={styles.lineWithBottomSpace} />
              <View style={styles.line} />
              <View style={styles.headerContainer}>
                <Text style={styles.titleStyle}>PURCHASE ORDER HEADER</Text>
                <View style={styles.shortLine} />
                <View style={styles.greyInfoContainer}>
                  <Text style={styles.infoTextLeft}>Order No.</Text>
                  <Text style={styles.infoText}>
                    {this.state.entityPurchaseOrder.order_number}
                  </Text>
                </View>
                <View style={styles.pinkInfoContainer}>
                  <Text style={styles.infoTextLeft}>Supplier Name</Text>
                  <Text style={styles.infoText}>
                    {this.state.entityPurchaseOrder.supplier_name}
                  </Text>
                </View>
                <View style={styles.lastGreyInfoContainer}>
                  <Text style={styles.infoTextLeft}>Supplier No.</Text>
                  <Text style={styles.infoText}>
                    {this.state.entityPurchaseOrder.supplier_number}
                  </Text>
                </View>
              </View>
              <View style={styles.lineWithBottomSpace} />
              <View style={styles.line} />
              <View style={styles.buttonView}>
                <TouchableOpacity
                  style={styles.submitAllCreateReceiptsButtonInactive}>
                  <View>
                    <Text style={styles.submitAllCreateReceiptsButtonText}>
                      RECEIVE ENTIRE PO
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.bottomContainer}>
                <Text style={styles.titleStyle}>PURCHASE ORDER LINES</Text>
                <View style={styles.shortLine} />
                <View style={styles.tableContainer}>
                  <View style={styles.header}>
                    <View style={styles.headerSection1}>
                      <Text style={styles.headerLabel} />
                    </View>
                    <View style={styles.headerSection2}>
                      <Text style={styles.headerLabel}>Item No.</Text>
                    </View>
                    <View style={styles.headerSection3}>
                      <Text style={styles.headerLabel}>Item Description</Text>
                    </View>
                    <View style={styles.headerSection4}>
                      <Text style={styles.headerLabel}>Dist No.</Text>
                    </View>
                    <View style={styles.headerSection5}>
                      <Text style={styles.headerLabel}>Delivery Date</Text>
                    </View>
                  </View>
                  <View style={styles.line} />

                  <FlatList
                    contentContainerStyle={styles.listContent}
                    data={this.state.dataObjects}
                    renderItem={this.renderRow}
                    keyExtractor={this.keyExtractor}
                    initialNumToRender={this.oneScreensWorth}
                    ListHeaderComponent={this.renderHeader}
                    ListFooterComponent={this.renderFooter}
                    ListEmptyComponent={this.renderEmpty}
                    ItemSeparatorComponent={this.renderSeparator}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(GrnPurchaseOrderDetails);
