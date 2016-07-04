# RN-COOK
 React Native AsyncStorage Debug Tool        
 
## Why 
AsyncStorage is very difficult to debug. I want to develop a tool that have a UI Interface. So, I did.   

	$ npm install rn-cook --save
 
## How to use       

	//1) install module
		$ npm install rn-cook --save
	
	//2) import module
		import RNCook from 'rn-cook';
	
	//3) write component on bottom of view container
		<RNCook/> 
		
	//4) for example
		<ScrollView style={styles.flex_1}>
        <View style={styles.logo}></View>
        <Text style={styles.fontTitle}>
         Read
        </Text>
        <Recommend/>
        <View style={styles.hr}></View>
        <Text style={styles.fontTitle}>
          Study
        </Text>
        <Grade navigator={this.props.navigator}/>
        <View style={styles.hr}></View>
        <Text style={styles.fontTitle}>
          Category
        </Text>
        <Category navigator={this.props.navigator}/>
        <CopyRight navigator={this.props.navigator}/>
        
        <RNCook/>
      </ScrollView>	
    
## Show Case 
### Table 
 ![](1.png)           
### Command          
 ![](2.png)  
### Edit        
 ![](3.png)           
 
       
 
 


