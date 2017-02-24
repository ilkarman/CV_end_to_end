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
  Dimensions
} from 'react-native';

// https://github.com/marcshilling/react-native-image-picker
import ImagePicker from 'react-native-image-picker';

var LanguageSelection = require('./LanguageSelection');

class ClassificationPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      chosenPicture: null,
      jsonClassification: null, // Returned classification
      classificationEnglish: ' ', // Keep size fixed
      classificationTranslated: ' ', // Keep size fixed
      translateTo: 'Spanish',  // Default language
      helper: 'Tap on the square below to start',
      isLoading: false,
      flag_img: 'es' // Loaded with xcode for speed
    };
    this.onLangChange = this.onLangChange.bind(this);
  }

  onLangChange(lang, icon) {
    // Change icon
    let flg_url = 'https://github.com/stevenrskelton/flag-icon/raw/master/png/36/country-4x3/'
    this.setState({
      translateTo: lang,
      flag_img: flg_url.concat(icon)
    })
    // Change text if response exists
    let jsonresp = this.state.jsonClassification 
    if (jsonresp !== null) {
      this.setState({
        classificationTranslated: jsonresp[lang]
      })
    }
  }
  
  handleLanguageResponse(response) {
    // Go to selection screen
    this.props.navigator.push({
      title: 'Languages',
      component: LanguageSelection,
      passProps: {
        languages: response,
        func: this.onLangChange // Push parent function
      },
    });
  }

  showAvailableLanguages(event) {
    fetch('http://csabyy.uksouth.cloudapp.azure.com:5005/languages').
    then((response) => response.json())
    .then(responseJson => this.handleLanguageResponse(responseJson.languages))
    .catch((error) => {
      console.error(error);
    })
  }

  sendImageToServer(body) {
    fetch('http://csabyy.uksouth.cloudapp.azure.com:5005/uploader_ios', {
      method: 'POST',
      body: body
    }).then((response) => response.json())
    .then((responseJson) => {
      var lk = this.state.translateTo
      this.setState({
        isLoading: false,
        jsonClassification: responseJson,
        classificationEnglish: responseJson['English'],
        classificationTranslated: responseJson[lk],
        helper: "Tap on the square to try another"
      });
    })
    .catch((error) => {
      console.error(error);
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
      helper: 'Running ...'
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
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
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
    var spinner = this.state.isLoading ?
      ( <ActivityIndicator
          size='large'/> ) :
      ( <View/>);
    return (
      <View style={styles.container}>
        <Text style={styles.smalltext}>
          {this.state.helper}
        </Text>
        <TouchableOpacity onPress={this.selectPhotoTapped.bind(this)}>
          <View style={[styles.chosenPhoto, styles.photoContainer, {marginBottom: 20}]}>
          { this.state.chosenPicture === null ? <Text>Select a Photo</Text> :
            <Image style={styles.chosenPhoto} source={this.state.chosenPicture} />
          }
          </View>
        </TouchableOpacity>
        <View style={{flex:1, marginTop:10}}>
        {spinner}
        </View>
        <View style={styles.languages}>
          <Text numberOfLines={1} style={styles.classification}>
            {this.state.classificationEnglish}
          </Text>
        </View>
        <View style={styles.results}>
        <Text style={styles.smalltext}>
        Tap on flag to change language
        </Text>
          <View style={styles.languages}>
            <TouchableOpacity onPress={this.showAvailableLanguages.bind(this)}>
              <Image style={styles.flag} source={{uri:this.state.flag_img}} />
            </TouchableOpacity>
            <Text numberOfLines={1} style={styles.description}>
              {this.state.classificationTranslated}
            </Text>
          </View>
        </View>
      </View>
    );
  }

}

var device_width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  flag:{
    width: 36,
    height: 27,
    marginRight: 10
  },
  results:{
    alignSelf: 'flex-start'
  },
  languages:{
    flexDirection: 'row',
    marginBottom: 30
  },
  smalltext: {
    fontSize: 8,
    marginBottom: 10
  },
  classification: {
    color: '#656565',
    fontSize: 24
  },
  description: {
    color: '#656565',
    fontSize: 18
  },
  container: {
    padding: 50,
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

module.exports = ClassificationPage;