import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  PixelRatio,
  AsyncStorage,
  ListView,
  TextInput,
  Alert
  } from 'react-native';

import Dimensions from 'Dimensions';

/*
* React Native AsyncStorage Debug Tool
* AsyncStorage Debug is very difficult. I want to develop a tool that have a UI Interface. So, I did.
* @author: vczero
* @platform: iOS & Android (React Native)
*
* */

let screen = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height
};

let pixel =  1 / PixelRatio.get();

const DESC = 'React Native AsyncStorage Debug Tool';

const TOOL_NAME = 'Spoon';

class Noodles extends Component{
  constructor(props){
    super(props);
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      isShowBtn: true,
      isShowList: false,
      isShowCommand: false,
      isShowDetail: false,
      dataSource: ds.cloneWithRows([]),
      isDataReady: false
    };
  }

  render(){
    var view = null;
    if(this.state.isShowBtn){
      view = this._btnView();
    }else if(this.state.isShowCommand){
      view = this._commandView();
    }else if(this.state.isShowList){
      view = this._listView();
    }else if(this.state.isShowDetail){
      view = this._detailView();
    }else{
      view = this._btnView();
    }
    return(view);
  }

  componentDidMount(){
    //this._getAllData();
  }

  _getAllData(){
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    let data = [];
    var that = this;

    AsyncStorage.getAllKeys((err, keys) => {
      AsyncStorage.multiGet(keys, (err, stores) => {
        stores.map((result, i, store) => {
          let key = store[i][0];
          let value = store[i][1];
          data.push({
            index: i,
            key: key,
            value: value
          });
        });
        that.setState({
          dataSource: ds.cloneWithRows(data),
          isDataReady: true
        });
      });
    });
  }

  _refreshData(){
    this.setState({
      isDataReady: false
    });
    this._getAllData();
  }

  _changeView(key){
    var obj = {
      isShowBtn: false,
      isShowList: false,
      isShowCommand: false,
      isShowDetail: false
    };
    obj[key] = true;
    this.setState(obj);
  }

  _showTable(){
    this._changeView('isShowList');
    this._refreshData();
  }


  _showDetail(viewName, storageKey){
    this._changeView(viewName);
    var that = this;
    AsyncStorage.getItem(storageKey, function(err, result){
      if(!err && result.length){
        that.setState({
          storageKey: storageKey,
          storageValue: result
        });
      }
    });
  }

  _clearAll(){
    var that = this;
    Alert.alert(
      'Are you sure clear all data?',
      "All data will be destroy on AsyncStorage. If not, please touch 'CANCEL' button , else , touch  'YES' button.",
      [
        {text: 'CANCEL', onPress: () => {}, style: 'cancel'},
        {text: 'YES', onPress: () => {
            AsyncStorage.clear();
            that.setState({
              isDataReady: false
            });
          }
        }
      ]
    );
  }

  _save(key, value){
    AsyncStorage.setItem(key, value, function(err){
      if(!err){
        Alert.alert('Information', 'save successful', [{text: 'OK', onPress: () => {}, style: 'cancel'}]);
      }else{
        Alert.alert('Information', 'save fail', [{text: 'OK', onPress: () => {}, style: 'cancel'}]);
      }
    });
  }

  _delete(key){
    var that = this;
    AsyncStorage.removeItem(key, function(err){
      if(!err){
        Alert.alert('Information', 'delete successful', [{text: 'OK', onPress: () => {}, style: 'cancel'}]);
        that._changeView('isShowList');
        that._refreshData();
      }else{
        Alert.alert('Information', 'delete fail', [{text: 'OK', onPress: () => {}, style: 'cancel'}]);
      }
    });
  }

  _btnView(){
    return(
      <TouchableOpacity style={[styles.tab, styles.center]} onPress={this._showTable.bind(this)}>
        <Image source={require('./logo.png')} style={styles.tab_img} resizeMode="contain"/>
      </TouchableOpacity>
    );
  }

  _console_submit(){
    var that = this;
    let cmd = this.state.console_command || '';
    const PO = 'Po';
    const De = 'De';
    if(cmd.indexOf(PO) > -1 && cmd.indexOf('-all') > -1){/*po -all*/
      AsyncStorage.getAllKeys((err, keys) => {
        AsyncStorage.multiGet(keys, (err, stores) => {
          let str = '$ ' + cmd + '\n';
          stores.map((result, i, store) => {
            let key = store[i][0];
            let value = store[i][1];
            str += '$' + key + '\n' + '$ ' + value + '\n';
          });
          that.setState({
            console_info:  str
          });
        });
      });
    }else if(cmd.indexOf(PO) > -1){
      let arr = cmd.split(PO +' ');
      if(arr.length === 2){
        let key = arr[1];
        that.setState({
          console_info: cmd
        });
        AsyncStorage.getItem(key, function(err, result){
          if(!err){
            that.setState({
              console_info:  '$ ' + cmd + '\n$ ' + result
            });
          }
        });
      }

    }else if(cmd.indexOf(De) > -1 && cmd.indexOf('-all') > -1){/*delete -all*/
      Alert.alert(
        'Are you sure clear all data?',
        "All data will be destroy on AsyncStorage. If not, please touch 'CANCEL' button , else , touch  'YES' button.",
        [
          {text: 'CANCEL', onPress: () => {}, style: 'cancel'},
          {text: 'YES', onPress: () => {
            AsyncStorage.clear();
            that.setState({
              console_info: '$ ' + cmd + '\n$ ' + 'clear all data'
            });
          }
          }
        ]
      );
    }else if(cmd.indexOf(De) > -1){
      let arr = cmd.split(De + ' ');
      if(arr.length === 2){
        let key = arr[1];
        AsyncStorage.removeItem(key, function(err){
          if(!err){
            that.setState({
              console_info: '$ ' + cmd + '\n$ ' + 'delete successful'
            });
          }else{
            Alert.alert('Information', 'delete fail', [{text: 'OK', onPress: () => {}, style: 'cancel'}]);
          }
        });
      }
    }else{/*alert*/
      Alert.alert('Information', 'Please use the following command', [{text: 'OK', onPress: () => {}, style: 'cancel'}]);
    }

  }

  _listView(){
    return(
      <View style={styles.list}>
        <View style={styles.list_title}>
          <Text style={styles.list_title_text}>{TOOL_NAME}</Text>
          <Text style={styles.list_title_desc}>{DESC}</Text>
        </View>
        <View style={[styles.row,styles.head_bg,styles.head_height]}>
          <View style={[styles.id_view,styles.center]}>
            <Text style={styles.head_text}>ID</Text>
          </View>
          <View style={[styles.key_view,styles.center]}>
            <Text style={styles.head_text}>Key</Text>
          </View>
          <View style={[styles.value_view,styles.center]}>
            <Text style={styles.head_text}>Value</Text>
          </View>
          <View style={[styles.operate_view,styles.center]}>
            <Text style={styles.head_text}>Edit</Text>
          </View>
        </View>
        <ScrollView style={styles.scroll}>
          {
            this.state.isDataReady?
              <ListView  dataSource={this.state.dataSource} renderRow={this._renderList.bind(this)} enableEmptySections={true}/>
              :<Text style={styles.data_loading}>data loading...</Text>
          }
        </ScrollView>
        <TouchableOpacity style={[styles.back_btn, styles.center]} onPress={this._changeView.bind(this, 'isShowBtn')}>
          <Text style={styles.back_text}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.command_view, styles.center]} onPress={this._changeView.bind(this, 'isShowCommand')}>
          <Text style={{color:'#fff'}}>Use Command</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.refresh_btn, styles.center]} onPress={this._refreshData.bind(this)}>
          <Text style={{color:'#fff'}}>Refresh Data</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.clear_btn, styles.center]} onPress={this._clearAll.bind(this)}>
          <Text style={{color:'#fff'}}>Clear All</Text>
        </TouchableOpacity>

      </View>
    );
  }

  _renderList(rowData){
    return(
      <View style={[styles.row,styles.head_height]}>
        <View style={[styles.id_view, styles.center,styles.cell_border]}>
          <Text style={styles.cell_text} numberOfLines={1}>{parseInt(rowData.index)+1}</Text>
        </View>
        <View style={[styles.key_view,styles.cell_border]}>
          <Text style={styles.cell_text} numberOfLines={1}>{rowData.key}</Text>
        </View>
        <View style={[styles.value_view,styles.cell_border]}>
          <Text style={styles.cell_text} numberOfLines={1}>{rowData.value}</Text>
        </View>
        <TouchableOpacity
          style={[styles.operate_view, styles.center,styles.cell_border,{backgroundColor:'#20B2AA'}]}
          onPress={this._showDetail.bind(this, 'isShowDetail', rowData.key)}>
          <Text style={styles.head_text} numberOfLines={1}>Detail</Text>
        </TouchableOpacity>
      </View>
    );
  }

  _detailView(){
    return(
      <View style={styles.list}>
        <View style={styles.list_title}>
          <Text style={styles.list_title_text}>{TOOL_NAME}</Text>
          <Text style={styles.list_title_desc}>{DESC}</Text>
        </View>
        <View>
          <Text style={styles.storage_key}>Key:  {this.state.storageKey}</Text>
          <TextInput style={styles.detail_input}
                     value={this.state.storageValue}
                     multiline={true}
                     onChangeText={(text) => this.setState({storageValue: text})}
                     editable={true}/>
        </View>
        <TouchableOpacity style={[styles.back_btn, styles.center]} onPress={this._showTable.bind(this)}>
          <Text style={styles.back_text}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.save_btn, styles.center]} onPress={this._save.bind(this, this.state.storageKey, this.state.storageValue)}>
          <Text style={{color:'#fff'}}>Save Data</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.delete_btn, styles.center]} onPress={this._delete.bind(this, this.state.storageKey)}>
          <Text style={{color:'#fff'}}>Delete Data</Text>
        </TouchableOpacity>
      </View>
    );
  }

  _commandView(){
    return(
      <View style={styles.list}>
        <View style={styles.list_title}>
          <Text style={styles.list_title_text}>{TOOL_NAME}</Text>
          <Text style={styles.list_title_desc}>{DESC}</Text>
        </View>
        <View>
          <TextInput style={styles.info_input} multiline={true} value={this.state.console_info} />
          <TextInput style={styles.console_input}
                     multiline={false}
                     onChangeText={(text) => this.setState({console_command: text})}
                     onEndEditing={this._console_submit.bind(this)}
                     vaule={this.state.console_command}
                     editable={true}/>
        </View>
        <Text style={styles.command_text}>You can use the following command： </Text>
        <Text style={styles.command_text}>$ Po key</Text>
        <Text style={styles.command_text}>$ Po -all</Text>
        <Text style={styles.command_text}>$ De key</Text>
        <Text style={styles.command_text}>$ De -all</Text>
        <TouchableOpacity style={[styles.back_btn, styles.center]} onPress={this._showTable.bind(this)}>
          <Text style={styles.back_text}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tab:{
    width:50,
    height:50,
    position:'absolute',
    top:50,
    right:30,
    borderRadius:25,
    borderColor:'#ccc',
    backgroundColor:'#fff'
  },
  tab_img:{
    width:25,
    height:25
  },
  list:{
    width:screen.width -20,
    top:10,
    position:'absolute',
    left:10,
    height:screen.height - 80,
    bottom:20,
    shadowOpacity: 1,
    shadowColor: '#ccc',
    shadowOffset:{width: 1*pixel, height: 1*pixel},
    backgroundColor:'#008B8B',
    borderRadius:4
  },
  scroll:{
    top:81,
    position:'absolute',
    left:5,
    right:5,
    width:screen.width -30,
    height:screen.height - 217,
    backgroundColor:'#fff'
  },
  list_title:{
    justifyContent:'center',
    alignItems:'center',
    height:50,
    marginTop:5
  },
  list_title_text:{
    fontSize:19,
    fontWeight:'900',
    color:'#fff'
  },
  list_title_desc:{
    color:'#fff'
  },
  back_btn:{
    position:'absolute',
    bottom:5,
    left:10,
    backgroundColor:'#fff',
    width:40,
    height:40,
    borderRadius:20
  },

  back_text:{
    color:'#000'
  },
  row:{
    flexDirection:'row'
  },
  id_view:{
    width:40,
  },
  key_view:{
    flex:3
  },
  value_view:{
    flex:7
  },
  operate_view:{
    flex:2
  },
  head_text:{
    color:'#fff'
  },
  cell_text:{
    fontWeight:'300',
    fontSize:13
  },
  head_bg:{
    backgroundColor:'#D2691E',
    width:screen.width -28,
    marginLeft:4
  },
  center:{
    justifyContent:'center',
    alignItems:'center'
  },
  head_height:{
    height:25
  },
  cell_border:{
    borderRightWidth:1*pixel,
    borderBottomWidth:1*pixel,
    borderColor:'#ccc'
  },
  command_view:{
    position:'absolute',
    bottom:10,
    left:160,
    height:30,
    paddingLeft:5,
    paddingRight:5,
    backgroundColor:'#008B8B',
    borderRadius:4
  },
  clear_btn:{
    position:'absolute',
    bottom:10,
    right:5,
    height:30,
    backgroundColor:'#ff1493',
    paddingLeft:5,
    paddingRight:5,
    borderRadius:4
  },
  refresh_btn:{
    position:'absolute',
    bottom:10,
    left:57,
    backgroundColor:'#008B8B',
    borderRadius:4,
    height:30,
    paddingLeft:5,
    paddingRight:5
  },
  data_loading:{
    marginTop:50,
    width:100,
    marginLeft:(screen.width - 20 - 100)/2
  },
  detail_input:{
    width: screen.width - 40,
    marginLeft:10,
    marginRight:10,
    height:screen.height -300,
    backgroundColor:'#fff',
    fontSize:13,
    padding:10,
    borderRadius:2
  },
  storage_key:{
    marginLeft:10,
    fontSize:15,
    color:'#FFFFFF',
    marginTop:20,
    marginBottom:5,
    fontWeight:'500'
  },
  save_btn:{
    position:'absolute',
    top: screen.height -300 + 110,
    left:10,
    height:30,
    paddingLeft:10,
    paddingRight:10,
    backgroundColor:'#008B8B',
    borderRadius:4
  },

  delete_btn:{
    position:'absolute',
    top: screen.height -300 + 110,
    left:90,
    height:30,
    paddingLeft:5,
    paddingRight:5,
    backgroundColor:'#008B8B',
    borderRadius:4
  },
  info_input:{
    width:screen.width - 40,
    height:screen.height - 400,
    backgroundColor:'#fff',
    marginBottom:10,
    paddingLeft:10,
    marginLeft:10,
    marginRight:10,
    borderRadius:4
  },
  console_input:{
    width:screen.width - 40,
    height:40,
    backgroundColor:'#fff',
    marginLeft:10,
    paddingLeft:10,
    marginRight:10,
    paddingTop:10
  },
  command_text:{
    marginLeft:10,
    color:'#fff',
    marginTop:3
  }

});

module.exports = Noodles;
