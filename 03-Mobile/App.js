'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  PixelRatio,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  AppRegistry
} from 'react-native';

// Using latest react-navigation for X-compatibility
// https://reactnavigation.org
import { StackNavigator } from 'react-navigation';
// https://github.com/marcshilling/react-native-image-picker
import ImagePicker from 'react-native-image-picker';

class HomeScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      chosenPicture: null,
      jsonClassification: null, // Returned classification
      classificationEnglish: ' ', // Keep size fixed
      classificationTranslated: ' ', // Keep size fixed
      classificationDetailed: ' ',
      enableDetailed: false, // Vision API
      translateTo: 'None',  // Default language
      isLoading: false,
      flag_img: null // Loaded with xcode for speed
    };
  }
  
  onLangChange(lang, icon) {
    // Change icon
    this.setState({
      translateTo: lang,
      flag_img: icon  // Added to xcode
    })
    // Change text if response exists
    let jsonresp = this.state.jsonClassification 
    if (jsonresp !== null) {
      this.setState({
        classificationTranslated: jsonresp[lang]
      })
    }
  }

  onDetailChange(detail_switch) {
    this.setState({
      enableDetailed: detail_switch
    })
  }

  showSettings(event) {
    const { navigate } = this.props.navigation;
    navigate('Settings',
      {
        funcLangChange: this.onLangChange.bind(this),
        funcDetailChange: this.onDetailChange.bind(this),
        detailedSwitch: this.state.enableDetailed,
        translateTo: this.state.translateTo
      })
  }

  sendImageToServer(body) {
    fetch('http://ilkarmanwhatsthis.azurewebsites.net//uploader_mobile', {
      method: 'POST',
      body: body
    }).then((response) => response.json())
    .then((responseJson) => {
      console.log(responseJson)
      var lk = this.state.translateTo
      this.setState({
        isLoading: false,
        jsonClassification: responseJson,
        classificationEnglish: responseJson['English'],
        classificationTranslated: responseJson[lk],
        classificationDetailed: responseJson['Caption']
      });
    })
    .catch((error) => {
      //console.error(error);
      this.setState({
        isLoading: false,
        jsonClassification: null,
        classificationEnglish: "Please try again"
      })
    });
  }

  classifyImage(imgUri) {
    this.setState({
      isLoading: true,
      jsonClassification: null,
      classificationEnglish: ' ',
      classificationTranslated: ' ',
      classificationDetailed: ' ',
    });
    var photo = {
      uri: imgUri,
      type: 'image/jpeg',
      name: 'photo.jpg'
    };
    var body = new FormData()
    body.append('imagefile', photo)
    this.sendImageToServer(body)
  }

  selectPhotoTapped() {
    // Adjust quality?
    const options = {
      quality: 0.75,
      maxWidth: 400,
      maxHeight: 400,
      mediaType: 'photo',
      noData: true,
      storageOptions: {
        skipBackup: true
      }
    };

    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);
      if (response.didCancel) {
        console.log('User cancelled photo picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        let source = { uri: response.uri };
        // Run classification
        this.classifyImage(source.uri)
        // Display chosen image
        this.setState({
          chosenPicture: source
        });
      }
    });
  }

  render() {
    const { navigate } = this.props.navigation;
    var spinner = this.state.isLoading ?
      ( <ActivityIndicator
          size='large'/> ) :
      ( <View/>);
    return (
      <View style={styles.container}>

        <View style={styles.menubar}>
          <TouchableOpacity 
            onPress={this.showSettings.bind(this)}>
                <Image style={styles.settings} source={{uri:'settings'}} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={this.selectPhotoTapped.bind(this)}>
          <View style={[styles.chosenPhoto, styles.photoContainer, {marginBottom: 20}]}>
          { this.state.chosenPicture === null ? <Text>Select a Photo</Text> :
            <Image style={styles.chosenPhoto} source={this.state.chosenPicture} />
          }
          </View>
        </TouchableOpacity>
        <View style={{flex:1, marginTop:5}}>
        {spinner}
        </View>

        <View style={styles.languages}>
          <Text numberOfLines={1} style={styles.classification}>
            {this.state.classificationEnglish}
          </Text>
        </View>

        <View style={styles.languages}>
          { (this.state.flag_img !== null) && 
              (this.state.classificationTranslated !== ' ') ? <Image 
            style={styles.flag} source={{uri:this.state.flag_img}} /> : null
          }   
          <Text numberOfLines={1} style={styles.description}>
            {this.state.classificationTranslated}
          </Text>
        </View>

        <View style={styles.languages}>
          {this.state.enableDetailed === true ? <Text
            numberOfLines={2} 
            style={styles.detail}>{this.state.classificationDetailed}</Text> : null }
        </View>


      </View>
    );
  }
}

var SettingsPage = require('./SettingsPage');
var LanguageSelection = require('./LanguageSelection');

//StackNavigator(RouteConfigs, StackNavigatorConfig)
const AwesomeProject = StackNavigator({
    Home: {
      screen: HomeScreen, 
      navigationOptions: {
        header: ({
          visible: false
        })
      }},
    Settings: {
      screen: SettingsPage, 
      navigationOptions: {title: 'Settings'}},
    Languages: {
      screen: LanguageSelection, 
      navigationOptions: {title: 'Languages'}}
  }, 
    {headerMode: 'screen'} // To allow hiding of navbar
  );

var device_width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  menubar:{
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    marginBottom: 10
  },
  flag:{
    borderColor: '#9B9B9B',
    borderWidth: 1 / PixelRatio.get(),
    width: 24,
    height: 15,
    marginRight: 5
    //width: 30,
    //height: 21
  },
  settings:{
    width: 21,
    height: 21,
    marginLeft: 10,
    marginRight: 10
  },
  results:{
    alignSelf: 'flex-start'
  },
  languages:{
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 15,
    marginBottom: 15
  },
  smalltext: {
    fontSize: 8,
    marginBottom: 10
  },
  classification: {
    color: '#656565',
    fontSize: 32
  },
  description: {
    color: '#656565',
    fontSize: 26
  },
  detail: {
    color: '#656565',
    fontSize: 16
  },
  container: {
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoContainer: {
    borderColor: '#9B9B9B',
    borderWidth: 1 / PixelRatio.get(),
    justifyContent: 'center',
    alignItems: 'center'
  },
  chosenPhoto: {
    width: device_width,
    height: device_width
  }
});

AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);