import React, {Component} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ImageBackground,
  FlatList,
  Image,
  TouchableHighlight,
  ActivityIndicator,
} from 'react-native';
import {connect} from 'react-redux';
import {Images} from '../Themes';
import GrnPurchaseOrderDetails from '././GrnPurchaseOrderDetails';
import DBGrnPurchaseOrderDataHelper from '../DB/DBGrnPurchaseOrderDataHelper';
import CreateReceiptsAPIHelper from '../APIHelper/CreateReceiptsAPIHelper';

import AppConfig from '../Config/AppConfig';
import Spinner from 'react-native-loading-spinner-overlay';
import Utils from '../Utils/Utils';
import {NavigationEvents} from 'react-navigation';
// Add Actions - replace 'Your' with whatever your reducer is called :)
// import YourActions from '../Redux/YourRedux'

// Styles
import styles from './Styles/GrnPurchaseOrderStyle';

// For API
import API from '../../App/Services/Api';
import FJSON from 'format-json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

class GrnPurchaseOrder extends React.PureComponent {
  api = {};
  static navigationOptions = {
    title: 'PURCHASE ORDER',
  };

  constructor(props) {
    super(props);
    this.api = API.create();

    this.state = {
      isLoading: false,
      filteredPurchaseOrders: [],
      dataObjects: [],
      finalPOToDisplay: [],
      envURL: '',
      allObjectsSendingToNextPage: [],
    };
  }

  //getting all data from local storage
  getAllDataFromLocalStorage = async () => {
    console.log('coming in home screen');
    const username = await Utils.retrieveDataFromAsyncStorage('USER_NAME');

    NetInfo.fetch().then(async state => {
      console.log('Connection type', state.type);
      console.log('Is connected?', state.isConnected);
      if (state && state.isConnected) {
        try {
          const keys = await AsyncStorage.getAllKeys();
          console.log(keys, 'keys in store...');
          const result = await AsyncStorage.multiGet(keys);
          console.log(result, 'result in store...');

          let updatedArr = result.filter((val, index) => {
            if (
              val[0] != 'savingArr' &&
              val[0] != 'USER_NAME' &&
              val[0] != 'ENVIRONMENT'
            ) {
              return val;
            }
          });
          console.log(updatedArr, 'updatedArrupdatedArr');
          updatedArr.map(async req => {
            console.log(req, 'req');
            if (req[0] == 'SAVE_ENTIRE_PO') {
              console.log('first');
              if (req && req.length > 1) {
                let entireArr = JSON.parse(req[1]);

                if (entireArr.length > 0) {
                  const response =
                    await CreateReceiptsAPIHelper.postCreateReceipt(
                      username,
                      entireArr,
                      this.state.envURL,
                    );
                  console.log(
                    response,
                    'Res from create receipt api Save entire PO',
                  );
                  setTimeout(async () => {
                    if (response && response.ok) {
                      console.log('Response API ok: ', response.data);
                      await AsyncStorage.removeItem('SAVE_ENTIRE_PO');
                    } else {
                      console.log('Response API: failed 99', response.problem);
                    }
                  }, 100);
                } else {
                  console.log('Please check your internet connection.');
                }
              }
            } else if (req[0] == 'SAVE_MULTILINE_PO') {
              if (req && req.length > 1) {
                let multiLineArr = JSON.parse(req[1]);

                if (multiLineArr.length > 0) {
                  const response =
                    await CreateReceiptsAPIHelper.postCreateReceipt(
                      username,
                      multiLineArr,
                      this.state.envURL,
                    );
                  console.log(
                    response,
                    'Res from create receipt api Save multiline Arr',
                  );
                  setTimeout(async () => {
                    if (response && response.ok) {
                      console.log('Response API ok: ', response.data);
                      await AsyncStorage.removeItem('SAVE_MULTILINE_PO');
                    } else {
                      console.log('Response API: failed 99', response.problem);
                    }
                  }, 100);
                } else {
                  console.log('Please check your internet connection.');
                }
              }
            } else if (req[0] == 'SAVE_SINGLE_LINE_PO') {
              console.log('thisrd');
              if (req && req.length > 1) {
                let singleLineArr = JSON.parse(req[1]);

                if (singleLineArr.length > 0) {
                  const response =
                    await CreateReceiptsAPIHelper.postCreateReceipt(
                      username,
                      singleLineArr,
                      this.state.envURL,
                    );
                  console.log(
                    response,
                    'Res from create receipt api Save singleline',
                  );
                  setTimeout(async () => {
                    if (response && response.ok) {
                      console.log('Response API ok: ', response.data);
                      await AsyncStorage.removeItem('SAVE_SINGLE_LINE_PO');
                    } else {
                      console.log('Response API: failed 99', response.problem);
                    }
                  }, 100);
                } else {
                  console.log('Please check your internet connection.');
                }
              }
            } else if (req[0] == 'SAVE_CHANGE_RECEIPT') {
              console.log('fourth');

              let chnageRecpObject = JSON.parse(req[1]);
              console.log(chnageRecpObject, 'chnageRecpObjectchnageRecpObject');

              let size = Object.keys(chnageRecpObject).length;

              let order_number;
              let order_line_number;
              let quantity;
              let unit_of_measure;
              let item_number;
              let item_description;
              let to_organization;
              let comments;
              let receipt_num;
              let deliver_tran_id;
              let receive_tran_id;
              let type;
              let file_id;

              for (const [key, value] of Object.entries(chnageRecpObject)) {
                console.log(`${key}: ${value}`);
                if (key == 'order_number') {
                  order_number = value;
                } else if (key == 'order_line_number') {
                  order_line_number = value;
                } else if (key == 'quantity') {
                  quantity = value;
                } else if (key == 'unit_of_measure') {
                  unit_of_measure = value;
                } else if (key == 'item_number') {
                  item_number = value;
                } else if (key == 'item_description') {
                  item_description = value;
                } else if (key == 'to_organization') {
                  to_organization = value;
                } else if (key == 'comments') {
                  comments = value;
                } else if (key == 'receipt_num') {
                  receipt_num = value;
                } else if (key == 'deliver_tran_id') {
                  deliver_tran_id = value;
                } else if (key == 'receive_tran_id') {
                  receive_tran_id = value;
                } else if (key == 'file_id') {
                  file_id = value;
                } else if (key == 'type') {
                  type = value;
                }
              }
              if (size > 0) {
                this.api = new API.create(this.state.envURL);

                const response = await this.api.postCorrectReceipt(
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
                  receive_tran_id,
                  type,
                  file_id,
                );

                console.log(response, 'Res from change receipt');
                setTimeout(async () => {
                  if (response && response.ok) {
                    console.log('Response API ok: ', response.data);
                    await AsyncStorage.removeItem('SAVE_CHANGE_RECEIPT');
                  } else {
                    console.log('Response API: failed 257', response.problem);
                  }
                }, 100);
              } else {
                console.log('no object found.');
              }
            } else if (req[0] == 'SAVE_REJECT_RECEIPT') {
              console.log('five');

              let rejectObj = JSON.parse(req[1]);
                 console.log(rejectObj, 'rejectObjrejectObj');

              let size = Object.keys(rejectObj).length;

              let order_number;
              let order_line_number;
              let quantity;
              let unit_of_measure;
              let item_number;
              let item_description;
              let to_organization;
              let comments;
              let receipt_num;
              let deliver_tran_id;
              let receive_tran_id;
              let type;
              let file_id;

              for (const [key, value] of Object.entries(rejectObj)) {
                console.log(`${key}: ${value}`);
                if (key == 'order_number') {
                  order_number = value;
                } else if (key == 'order_line_number') {
                  order_line_number = value;
                } else if (key == 'quantity') {
                  quantity = value;
                } else if (key == 'unit_of_measure') {
                  unit_of_measure = value;
                } else if (key == 'item_number') {
                  item_number = value;
                } else if (key == 'item_description') {
                  item_description = value;
                } else if (key == 'to_organization') {
                  to_organization = value;
                } else if (key == 'comments') {
                  comments = value;
                } else if (key == 'receipt_num') {
                  receipt_num = value;
                } else if (key == 'deliver_tran_id') {
                  deliver_tran_id = value;
                } else if (key == 'receive_tran_id') {
                  receive_tran_id = value;
                } else if (key == 'file_id') {
                  file_id = value;
                } else if (key == 'type') {
                  type = value;
                }
              }
              if (size > 0) {
                this.api = new API.create(this.state.envURL);

                const response = await this.api.postCorrectReceipt(
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
                  receive_tran_id,
                  type,
                  file_id,
                );

                console.log(response, 'Res from reject receipt');
                setTimeout(async () => {
                  if (response && response.ok) {
                    console.log('Response API ok: ', response.data);
                    await AsyncStorage.removeItem('SAVE_REJECT_RECEIPT');
                  } else {
                    console.log('Response API: failed 326', response.problem);
                  }
                }, 100);
              } else {
                console.log('no object found.');
              }
            }
          });
        } catch (error) {
          console.error(error, 'err while taking from storage...');
        }
      } else {
        alert('Please check your internet connection.');
      }
    });
  };

  componentDidMount() {
    this.refreshPayload();
  }

  refreshPayload = () => {
    this.getAllDataFromLocalStorage();
    this.getPurchaseOrderApi();
  };

  // MARK: Api
  async getPurchaseOrderApi() {
    this.setState({
      isLoading: false,
    });

    const environment = await Utils.retrieveDataFromAsyncStorage('ENVIRONMENT');
    console.log('Environment Variable (API) ', environment);
    //console.tron.log("Original baseURL", API.create(baseURL));
    // envURL = "";
    if (environment == 'SKAD3') {
      console.log('INTO IF');
      envURL =
        'https://skad3a1-skanskapaas.inoappsproducts.com/ords/inoapps_ec/';
      console.log('New ENV URL ', envURL);
      //this.api = new API.create(envURL);
      console.log(this.api, 'LETS GOOOO');
      this.setState({
        envURL: envURL,
      });
    } else if (environment == 'SKAD2') {
      envURL =
        'https://skad2a1-skanskapaas.inoappsproducts.com/ords/inoapps_ec/';
      console.log('New ENV URL ', envURL);
      // this.api = new API.create(envURL);
      this.setState({
        envURL: envURL,
      });
    } else if (environment == 'SKAD1') {
      envURL =
        'https://skad1a1-skanskapaas.inoappsproducts.com/ords/inoapps_ec/';
      console.log('New ENV URL ', envURL);
      //this.api = new API.create(envURL);
      this.setState({
        envURL: envURL,
      });
    } else if (environment == 'SKAT1') {
      envURL =
        'https://skat1a1-skanskapaas.inoappsproducts.com/ords/inoapps_ec/';
      console.log('New ENV URL ', envURL);
      //this.api = new API.create(envURL);
      this.setState({
        envURL: envURL,
      });
    } else if (environment == 'PTEST2') {
      envURL = 'https://ptest2a1-inoapps4.inoapps.com/ords/inoapps_ec/';
      console.log('New ENV URL ', envURL);
      //this.api = new API.create(envURL);
      this.setState({
        envURL: envURL,
      });
    } else if (environment == 'PDEV1') {
      envURL = 'https://pdev1a1-inoapps4.inoapps.com/ords/inoapps_ec/';
      // this.api = new API.create(envURL);
      console.log('New ENV URL RECEIPTS ', envURL);
      this.setState({
        envURL: envURL,
      });
    } else if (environment == 'PDEV2') {
      envURL = 'https://pdev2a1-inoapps4.inoapps.com/ords/inoapps_ec/';
      // this.api = new API.create(envURL);
      console.log('New ENV URL RECEIPTS ', envURL);
      this.setState({
        envURL: envURL,
      });
    } else if (environment == 'PTEST1') {
      envURL = 'https://ptest1a1-inoapps4.inoapps.com/ords/inoapps_ec/';
      // this.api = new API.create(envURL);
      console.log('New ENV URL RECEIPTS ', envURL);
      this.setState({
        envURL: envURL,
      });
    } else if (environment == 'PDEV3') {
      envURL = 'https://pdev3a1-inoapps4.inoapps.com/ords/inoapps_ec/';
      // this.api = new API.create(envURL);
      console.log('New ENV URL RECEIPTS ', envURL);
      this.setState({
        envURL: envURL,
      });
    } else if (environment == 'PTEST3') {
      envURL = 'https://ptest3a1-inoapps4.inoapps.com/ords/inoapps_ec/';
      // this.api = new API.create(envURL);
      console.log('New ENV URL RECEIPTS ', envURL);
      this.setState({
        envURL: envURL,
      });
    } else if (environment == 'PDEMO') {
      envURL = 'https://pdemo1a1-inoapps4.inoapps.com/ords/inoapps_ec/';
      // this.api = new API.create(envURL);
      console.log('New ENV URL RECEIPTS ', envURL);
      this.setState({
        envURL: envURL,
      });
    } else if (environment == 'SKAD4') {
      envURL =
        'https://skad4a1-skanskapaas.inoappsproducts.com/ords/inoapps_ec/';
      // this.api = new API.create(envURL);
      console.log('New ENV URL RECEIPTS ', envURL);
      this.setState({
        envURL: envURL,
      });
    } else if (environment == 'SKAD5') {
      envURL =
        'https://skad5a1-skanskapaas.inoappsproducts.com/ords/inoapps_ec/';
      this.api = new API.create(envURL);
      console.log('New ENV URL RECEIPTS ', envURL);
      this.setState({
        envURL: envURL,
      });
    } else if (environment == 'SKAP') {
      envURL =
        'https://skap1a1-skanskapaas.inoappsproducts.com/ords/inoapps_ec/';
      this.api = new API.create(envURL);
      console.log('New ENV URL RECEIPTS ', envURL);
      this.setState({
        envURL: envURL,
      });
    } else if (environment == 'GTDEV1') {
      envURL =
        'https://gtdev1a1-gallifordtrypaas.inoappsproducts.com/ords/inoapps_ec/';
      this.api = new API.create(envURL);
      console.log('New ENV URL RECEIPTS ', envURL);
      this.setState({
        envURL: envURL,
      });
    }

    const api = API.create(envURL);
    console.log('New ENV URL PO WORKING??? ', envURL);

    const username = await Utils.retrieveDataFromAsyncStorage('USER_NAME');
    console.log(username, 'username is storage>>>>');
    const response = await api.getPurchaseOrders(username);
    const purchaseOrders = response.data.items;
    console.log('Purchase Orders first>>>: ', purchaseOrders);

    // Save to DB
    // await DBGrnPurchaseOrderDataHelper.savePurchaseOrders(purchaseOrders);

    this.setState({
      isLoading: false,
    });

    setTimeout(() => {
      let sortedProductsAsc;

      sortedProductsAsc = purchaseOrders.sort((a, b) =>
        b.order_number.localeCompare(a.order_number),
      );

      return this.directCallingAfterGettingApiRes(sortedProductsAsc);
      this.getDBGrnPurchaseOrder();
    }, 100);

    // this.setState({
    //   isLoading: true,
    //
    // })
    // const api = API.create();
    // const username = await Utils.retrieveDataFromAsyncStorage("USER_NAME");
    // const response = await api.getPurchaseOrders(username);
    //
    // this.setState({
    //   isLoading: false,
    // })
    //
    // setTimeout(async() => {
    //   const purchaseOrders = response.data.items;
    //  console.log("PurchaseOrders: ", purchaseOrders);
    //
    // Save to DB
    // await DBGrnPurchaseOrderDataHelper.savePurchaseOrders(purchaseOrders);

    //   await this.getAllDBGrnPurchaseOrder(purchaseOrders);
    // }, 100)
  }

  async directCallingAfterGettingApiRes(ordersGettingFromApi) {
    this.setState({
      allObjectsSendingToNextPage: ordersGettingFromApi,
      filteredPurchaseOrders: [],
      finalPOToDisplay: [],
      dataObjects: [],
    });

    ordersGettingFromApi.map(po => {
      // console.log('coming in po new method', po);
      // filter out the status close po
      if (po.header_status.toUpperCase() == 'OPEN') {
        if (po.quantity_available_to_receive > 0) {
          this.state.filteredPurchaseOrders.push(po);
        } else {
          console.log('sufficient quantity_available_to_receive');
        }
      } else {
        console.log('CLOSED FOR RECEIVING');
      }
    });

    var test = this.state.filteredPurchaseOrders;
    var final = this.state.finalPOToDisplay;

    // check if PO number exist
    for (let i = 0; i < test.length; i++) {
      let po = test[i];
      if (this.checkPONoExist(this.state.finalPOToDisplay, po)) {
        // console.log('Existing');
      } else {
        console.log(po);
        final.push(po);
      }
    }

    // bind data to array of display
    this.setState(
      {
        dataObjects: this.state.finalPOToDisplay,
      },
      async () => {
        await DBGrnPurchaseOrderDataHelper.savePurchaseOrders(
          ordersGettingFromApi,
        );
      },
    );
  }

  async getDBGrnPurchaseOrder() {
    this.setState({
      filteredPurchaseOrders: [],
      finalPOToDisplay: [],
      dataObjects: [],
    });
    // Retrieve from DB
    let dbPurchaseOrders =
      await DBGrnPurchaseOrderDataHelper.getPurchaseOrders();

    console.log('DB purchase order: ', dbPurchaseOrders);

    dbPurchaseOrders.map(po => {
      console.log('coming in po', po);
      // filter out the status close po
      if (po.header_status.toUpperCase() == 'OPEN') {
        if (po.quantity_available_to_receive > 0) {
          this.state.filteredPurchaseOrders.push(po);
        } else {
          console.log('sufficient quantity_available_to_receive');
        }
      } else {
        console.log('CLOSED FOR RECEIVING');
      }
    });

    var test = this.state.filteredPurchaseOrders;
    var final = this.state.finalPOToDisplay;

    // check if PO number exist
    for (let i = 0; i < test.length; i++) {
      let po = test[i];
      if (this.checkPONoExist(this.state.finalPOToDisplay, po)) {
        console.log('Existing');
      } else {
        console.log(po);
        final.push(po);
      }
    }

    // bind data to array of display
    this.setState({
      dataObjects: this.state.finalPOToDisplay,
    });
  }

  checkPONoExist(puchaseOrders, po) {
    for (var i = 0; i < puchaseOrders.length; i++) {
      if (puchaseOrders[i].order_number == po.order_number) {
        return true;
      }
    }
    return false;
  }

  async updatePurchaseOrderStatus(
    order_number,
    distribution_number,
    order_line_number,
    edited,
    submitStatus,
    submittedTime,
    quantity,
    quantity_received,
    comments,
    photoURL,
  ) {
    await DBGrnPurchaseOrderDataHelper.updatePOStatus(
      order_number,
      distribution_number,
      order_line_number,
      edited,
      submitStatus,
      submittedTime,
      quantity,
      quantity_received,
      comments,
      photoURL,
    );
  }

  async deletePurchaseOrder(dbPurchaseOrder) {
    // Delete from DB
    await DBGrnPurchaseOrderDataHelper.deletePurchaseOrders(dbPurchaseOrder);
  }
  /************************************************************
   * STEP 1
   * This is an array of objects with the properties you desire
   * Usually this should come from Redux mapStateToProps
   *************************************************************/
  state = {
    dataObjects: [],
  };

  /* ***********************************************************
  * STEP 2
  * `renderRow` function. How each cell/row should be rendered
  * It's our best practice to place a single component here:
  *
  * e.g.
    return <MyCustomCell title={item.title} description={item.description} />
  *************************************************************/
  renderRow = ({item}) => {
    return (
      <TouchableHighlight
        onPress={() => {
          this.props.navigation.navigate('GrnPurchaseOrderDetails', {
            entityPurchaseOrder: item,
            // dataObjects: this.state.dataObjects,
            dataObjects: this.state.allObjectsSendingToNextPage,
          });
        }}>
        <View>
          <View style={styles.row}>
            <View style={styles.rowSection1}>
              <Text style={styles.rowLabel}>{item.order_number}</Text>
            </View>
            <View style={styles.rowSection2}>
              <Text style={styles.rowLabel}>{item.supplier_name}</Text>
            </View>
            <View style={styles.rowSection3}>
              <Text style={styles.rowLabel3}>{item.header_status}</Text>
            </View>
            <View style={styles.rowSection4}>
              <Image
                source={Images.rightArrow}
                style={styles.rightArrow}
                resizeMode="stretch"
              />
            </View>
          </View>
          <View style={styles.rowSeparatorLine} />
        </View>
      </TouchableHighlight>
    );
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
    return (
      <View style={styles.container}>
        <NavigationEvents
          onWillFocus={payload => {
            console.log('will focus', payload);
            this.refreshPayload();
          }}
        />
        <Spinner visible={this.state.isLoading} />

        <ImageBackground
          source={Images.grnPurchaseOrderBackground}
          style={styles.backgroundImage}>
          <View style={styles.header}>
            <View style={styles.headerSection1}>
              <Text style={styles.headerLabel}>Order No</Text>
            </View>
            <View style={styles.headerSection2}>
              <Text style={styles.headerLabel}>Supplier Name</Text>
            </View>
            <View style={styles.headerSection3}>
              <Text style={styles.headerLabel}>Header Status</Text>
            </View>
          </View>
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
        </ImageBackground>
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    // ...redux state to props here
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(GrnPurchaseOrder);
