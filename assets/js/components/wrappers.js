import React from 'react';


export class FieldWrapper extends React.Component {


    renderControlledField(classes){
        return <div className={classes} key={this.props.label} >
            <label htmlFor={this.props.label} className="col-sm-3 col-xs-12 control-label">{this.props.title}</label>
            <div className="col-sm-6 col-xs-7">
                {  this.props.errors && <span className="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span> }
                {  this.props.children }
                {  this.description() }
                {  this.includedIn() }
            </div>
            <div className="col-sm-3 col-xs-5 list-controls">
                <div className="btn-group btn-group-xs " role="group">
                    <button className="btn btn-default" onClick={this.props.children.props.moveUp}>
                        <span className="glyphicon glyphicon-arrow-up" aria-hidden="true" ></span>
                    </button>
                    <button className="btn btn-default" onClick={this.props.children.props.moveDown}>
                        <span className="glyphicon glyphicon-arrow-down" aria-hidden="true" ></span>
                    </button>
                    <button className="btn btn-default" onClick={this.props.children.props.removeItem}>
                        <span className="glyphicon glyphicon-remove" aria-hidden="true" ></span>
                    </button>
                    </div>
            </div>
        </div>
    }

    description() {
        return this.props.description && <em className="description">{this.props.description}</em>
    }

    includedIn() {
        return this.props.schema && this.props.schema.includedIn && <em className="included-in"><div><strong>Used in:</strong></div> {this.props.schema.includedIn.join(', ')}</em>
    }

    render() {
        const hints = (this.props.schema && this.props.schema['x-hints'] &&
            this.props.schema['x-hints'].form && this.props.schema['x-hints'].form || {})
        //const width = hints.width;
        const invisible = hints.inputComponent === 'invisible';
        const inline = hints.inline;
        const ignore = this.props.schema && this.props.schema.ignore
        if(invisible || ignore){
            return false;
        }
        if(inline){
            return this.renderInline();
        }
        /*if(width && false){
            const classes = 'col-sm-' + (12/width);
            return <div className={classes}>
                { this.renderField() }
                </div>
        }*/
        return this.renderField();
    }

    renderInline() {
        return <label className="checkbox-inline">
                {this.props.children } {this.props.title}
        </label>
    }

    renderField() {
        let classes = 'form-group ';
        if(this.props.errors){
            classes += 'has-error has-feedback ';
        }
        if(this.props.children.props.isArrayItem){
            return this.renderControlledField(classes, this.props)
        }

        return <div className={classes} key={this.props.label} >
            <label htmlFor={this.props.label} className="col-sm-3 control-label">{this.props.title}</label>
                <div className="col-sm-9">
                    { this.props.errors && <span className="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span> }
                    { this.props.children }
                    { this.description() }
                    { this.includedIn() }
                </div>
            </div>
    }
}


export class SectionWrapper extends React.Component {

    errors() {
        return <span className="has-error has-feedback">
           { this.props.errors.map((e, i) => {
                return <label key={i} className="control-label">{ e }</label>
            }) }
        </span>
    }

    description() {
        return this.props.description && <em className="description">{this.props.description}</em>
    }

    includedIn() {
        return this.props.schema && this.props.schema.includedIn && <em className="included-in"><div><strong>Used in:</strong></div> {this.props.schema.includedIn.join(', ')}</em>
    }

    renderControlledSection(){
        let classes = "fieldset form-section form-subsection with-controls"
        return <div  className={ classes }>
            <div>
            {/*<label htmlFor={this.props.label} className="col-sm-2 col-xs-12 control-label">{this.props.title}</label> */}
            <div className="controlled-section">
                { this.props.children }
            </div>
            { <div className="list-controls">
                <div className="btn-group  btn-group-xs" role="group">
                    <button className="btn btn-default" onClick={this.props.moveUp}>
                        <span className="glyphicon glyphicon-arrow-up" aria-hidden="true" ></span>
                    </button>
                    <button className="btn btn-default" onClick={this.props.moveDown}>
                        <span className="glyphicon glyphicon-arrow-down" aria-hidden="true" ></span>
                    </button>
                    <button className="btn btn-default" onClick={this.props.removeItem}>
                        <span className="glyphicon glyphicon-remove" aria-hidden="true" ></span>
                    </button>
                    </div>
            </div> }

        </div>
        </div>
    }

    renderSection() {
        if(this.props.canRemoveItem){
            return this.renderControlledSection()
        }
        return <div className="fieldset form-section form-subsection">
            { this.props.title && <legend>{ this.props.title }   { this.props.errors && this.errors() }</legend>}

            { this.description() }
            { this.includedIn() }
            <div>
            { this.props.children }
            { this.props.addItem && <div className="add-item"><button onClick={this.props.addItem}>Add Entry</button></div>}
            </div>
            </div>
    }

    render() {
        return this.renderSection();

    }
}
