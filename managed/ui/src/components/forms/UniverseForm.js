import React, { Component, PropTypes } from 'react';
import YBInput from '../../components/YBInputField';
import YBSelect from './../fields/YBSelect';
import YBCheckBox from './../fields/YBCheckBox';
import YBMultiSelect from './../fields/YBMultiSelect';
import YBNumericInput from './../fields/YBNumericInput';
import { Field } from 'redux-form';
import YBModal from './../fields/YBModal';
import {isValidObject} from '../../utils/ObjectUtils';

export default class UniverseForm extends Component {

  static propTypes = {
    type: PropTypes.oneOf(['Edit', 'Create']).isRequired,
  }

  constructor(props) {
    super(props);
    this.providerChanged = this.providerChanged.bind(this);
    this.regionListChanged = this.regionListChanged.bind(this);
    this.instanceTypeChanged = this.instanceTypeChanged.bind(this);
    this.numNodesChanged = this.numNodesChanged.bind(this);
    var azInitState = true;
    if (isValidObject(this.props.universe.currentUniverse)) {
      azInitState = this.props.universe.currentUniverse.universeDetails.userIntent.isMultiAZ
    }
    this.state = { providerSelected: '',
                   regionSelected: [], instanceTypeSelected: 'm3.medium',
                   numNodes: 3, azCheckState: azInitState };

  }

  componentWillMount() {

    if(this.props.type === "Edit") {
      var providerUUID = this.props.universe.currentUniverse.provider.uuid;
      this.setState({providerSelected: providerUUID});
      this.setState({instanceTypeSelected: this.props.universe.currentUniverse.universeDetails.userIntent.instanceType});
      this.props.getInstanceTypeListItems(providerUUID);
    }
  }
  
  providerChanged(event) {
    var providerUUID = event.target.value;
    this.setState({providerSelected: providerUUID});
    this.props.getInstanceTypeListItems(providerUUID);
  }

  regionListChanged(value) {
    this.setState({regionSelected: value});
  }

  instanceTypeChanged(event) {
    this.setState({instanceTypeSelected: event.target.value});
  }

  numNodesChanged(event) {
    this.setState({numNodes: event.target.value});
  }

  render() {
    var self = this;

    const { visible, onHide, handleSubmit, title} = this.props;

    var azCheckStateChanged =function() {
      self.setState({azCheckState: !self.state.azCheckState});
    }

    var universeProviderList = this.props.cloud.providers.map(function(providerItem, idx) {
      return <option key={providerItem.uuid} value={providerItem.uuid}>
        {providerItem.name}
      </option>;
    });
    universeProviderList.unshift(<option key="" value=""></option>);


    var universeRegionList = this.props.cloud.regions.map(function (regionItem, idx) {
      return {value: regionItem.uuid, label: regionItem.name};
    });

    var universeInstanceTypeList =
      this.props.cloud.instanceTypes.map(function (instanceTypeItem, idx) {
        return <option key={instanceTypeItem.instanceTypeCode}
                       value={instanceTypeItem.instanceTypeCode}>
          {instanceTypeItem.instanceTypeCode}
        </option>
      });
    if(universeInstanceTypeList.length > 0) {
      universeInstanceTypeList.unshift(<option key="" value="">Select</option>);
    }

    var submitAction = this.props.type==="Create" ? handleSubmit(this.props.submitCreateUniverse) :
      handleSubmit(this.props.submitEditUniverse);
    return (
           <YBModal visible={visible}
                    onHide={onHide} title={title} onFormSubmit={submitAction} formName={"UniverseForm"}>
              <Field name="universeName" type="text" component={YBInput} label="Universe Name" />
              <Field name="provider" type="select" component={YBSelect} label="Provider"
                     options={universeProviderList} onChange={this.providerChanged}
                     defaultValue={this.state.providerSelected}
                     value={this.state.providerSelected}
              />
              <Field name="regionList" component={YBMultiSelect}
                     label="Regions" options={universeRegionList}
                     onChange={this.regionListChanged}
                     value={this.state.regionSelected} multi={this.state.azCheckState}/>

              <Field name="numNodes" type="text" component={YBNumericInput}
                     label="Number Of Nodes"
                     value={this.state.numNodes} onChange={this.state.numNodesChanged} />
              <div className="universeFormSplit">
                Advanced
              </div>
              <Field name="isMultiAZ" type="checkbox" component={YBCheckBox}
                     label="Multi AZ" onClick={azCheckStateChanged}/>
              <Field name="instanceType" type="select" component={YBSelect} label="Instance Type"
                     options={universeInstanceTypeList}
                     defaultValue={this.state.instanceTypeSelected}
                     
              />
              <Field name="ybServerPackage" type="text" component={YBInput}
                     label="Server Package" defaultValue={this.state.ybServerPackage} />
           </YBModal>
    )
  }
}

UniverseForm.propTypes = {
  "title": PropTypes.string.isRequired
}
