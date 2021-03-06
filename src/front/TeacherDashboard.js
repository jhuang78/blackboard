var React = require('react');
var $ = require('jquery');
var $cookie = require('jquery.cookie');

var DatePicker = require('react-datepicker');

var moment = require('moment');

var say = require('./say');

var Header = require('./Header');

var Modal = require('react-bootstrap').Modal;
var Button = require('react-bootstrap').Button;




var TeacherDashboard = React.createClass({
	selectedClassId: null,
	selectedAssignId: null,
	newClass: {},
	newAssignment: {},

	render: function() {

		var selectClass = function(event) {
			this.selectedClassId = event.target.value;
			this.refreshAssignments();
		}.bind(this);

		var nameChanged = function(event) {
			if(!event.target.dataset.id) {
				this.newClass.name = event.target.innerText;
				return;
			}

			this.upsertClass({
				_id: event.target.dataset.id,
				name: event.target.innerText
			});
		}.bind(this);

		var onNewClass = function(event) {
			this.upsertClass(this.newClass);
		}.bind(this);

		var onDeleteClass = function(event) {
			this.setState({showWarning: true, deleteType: 'class', deleteId: event.target.dataset.id});			
		}.bind(this);

		var selectAssignment = function(event) {
			this.selectedAssignId = event.target.value;
		}.bind(this);

		var titleChanged = function(event) {
			if(!event.target.dataset.id) {
				this.newAssignment.title = event.target.innerText;
				return;
			}

			if(event.charCode === undefined || (event.charCode == 13 && !event.shiftKey)) {
				event.preventDefault();
				this.updateAssignments({
					_id: event.target.dataset.id,
					title: event.target.innerText
				});
				event.target.blur();
			}
		}.bind(this);

		var descChanged = function(event) {
			if(!event.target.dataset.id) {
				this.newAssignment.description = event.target.innerText;
				return;
			}

			if(event.charCode === undefined || (event.charCode == 13 && !event.shiftKey)) {
				event.preventDefault();
				this.updateAssignments({
					_id: event.target.dataset.id,
					description: event.target.innerText
				});
				event.target.blur();
			}
		}.bind(this);

		var assignmentDueChanged = function(_id, date) {
			if(!event.target.dataset.id) {
				this.newAssignment.due = date;
				return;
			}

			this.updateAssignments({
				_id: _id,
				due: date
			})
		}.bind(this);

		var assignmentActiveChanged = function(event) {
			if(!event.target.dataset.id) {
				this.newAssignment.active = event.target.checked;
				return;
			}

			this.updateAssignments({
				_id: event.target.dataset.id,
				active: event.target.checked
			});
		}.bind(this);

		var onNewAssignment = function(event) {
			// this.updateAssignments({
			// 	title: 'New Assignment',
			// 	class: this.selectedClassId,
			// 	due: moment().format()
			// });
			this.updateAssignments(this.newAssignment)
		}.bind(this);

		var onDeleteAssignment = function(event) {
			this.setState({showWarning: true, deleteType: 'assignment', deleteId: event.target.dataset.id});			
		}.bind(this);

		var onConfirmedDelete = function() {
			if(this.state.deleteType === 'assignment') {
				$.ajax({
					url: '/teacher/deleteAssignment/' + this.state.deleteId,
					type: 'POST'
				}).fail(function(err) {
					say.error(err);
				}).done(function(data) {
					this.refreshAssignments();
				}.bind(this));
			} else {
				$.ajax({
					url: '/teacher/deleteClass/' + this.state.deleteId,
					type: 'POST'
				}).fail(function(err) {
					say.error(err);
				}).done(function(data) {
					this.refreshClasses();
				}.bind(this));
			}
			this.setState({showWarning: false});
		}.bind(this);

		var onCloseWarning = function() {
			console.log('close');
			this.setState({showWarning: false});
		}.bind(this);

		var onShowWarning = function() {
			this.setState({showWarning: true});
		}.bind(this);


		this.newAssignment.class = this.selectedClassId;
		console.log('classId', this.selectedClassId);

		return (
			<div className='row'>
				<div className='col-md-1' />
				<div className='col-md-11'>
					<Header title='Teacher Dashboard'/>
					<ul className="nav nav-pills">
						<li role="presentation" className="active"><a href="/teacher">Classes and Assignments</a></li>
						<li role="presentation"><a href="/teacher/students">Student Management</a></li>
					</ul>


				<Modal show={this.state.showWarning} onHide={onCloseWarning}>
          <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure to delete this {this.state.deleteType}?</p>
          </Modal.Body>
          <Modal.Footer>
          	<Button bsStyle='danger' onClick={onConfirmedDelete}>Confirm</Button>
            <Button onClick={onCloseWarning}>Cancel</Button>
          </Modal.Footer>
        </Modal>

					<div className='row'>
						<div className='col-md-2'>
							<div className='form-group'>
								<h2>Class</h2>
								<table className='table table-hover table-striped table-condensed'>
									<thead>
										<tr>
											<th></th>
											<th></th>
											<th></th>
										</tr>
									</thead>
									<tbody> 
									{
										this.state.classes.map(function(cls) {
											return (
												<tr>
													{
														(cls._id) 
														?	(<td><input type='radio' name='selectedClass' value={cls._id} onChange={selectClass}></input></td>)
														: (<td></td>)
													}
													<td data-id={cls._id} contentEditable={true} onBlur={nameChanged} >{cls.name}</td>
													{
														(cls._id) 
															? (<td><button data-id={cls._id} type='button' className='btn btn-danger btn-xs' onClick={onDeleteClass}>x</button></td>)
															: (<td><button type='button' className='btn btn-success btn-xs' onClick={onNewClass}>+</button></td>)
													}
												</tr>
											);
										})
									}
									</tbody>
								</table>
							</div>
						</div>
						<div className='col-md-8'>
							<div className='form-group'>
								<h2>Assignments</h2>
								<table className='table table-hover table-striped table-condensed'>
									<thead>
										<tr>
											<th>Title</th>
											<th>Description</th>
											<th>Due</th>
											<th>Active</th>
											<th></th>
										</tr>
									</thead>
									<tbody> 
									{
										this.state.assignments.map(function(assignment) {
											return (
												<tr>
													<td data-id={assignment._id} contentEditable={true} onKeyPress={titleChanged} onBlur={titleChanged} >{assignment.title}</td>
													<td data-id={assignment._id} contentEditable={true} onKeyPress={descChanged} onBlur={descChanged} >{assignment.description}</td>
													<td><DateCell _id={assignment._id} date={assignment.due} onChange={assignmentDueChanged} /></td>	
													<td><input data-id={assignment._id} type='checkbox' defaultChecked={assignment.active} onChange={assignmentActiveChanged} /></td>
													{
														(assignment._id) 
															? (<td><button data-id={assignment._id} type='button' className='btn btn-danger btn-xs' onClick={this.onDeleteAssignment}>x</button></td>)
															: (<td><button type='button' className='btn btn-success btn-xs' onClick={onNewAssignment}>+</button></td>)
													}
												</tr>
											);
										}.bind(this))
									}
									</tbody>
								</table>
							</div>
						</div>
					</div>	
				</div>
			</div>
		);
	},



	getInitialState: function() {
		return {
			classes: [],
			assignments: [],
			showWarning: false
		};
	},

	componentDidMount: function() {
		this.refreshClasses();
	},


	refreshClasses: function() {
		$.ajax({
			url: '/teacher/getClasses',
			type: 'GET'
		}).fail(function(err) {
			say.error(err);
		}).done(function(data) {
			data.push({});
			this.setState({classes: data});
		}.bind(this));
	},

	upsertClass: function(update) {
		$.ajax({
			url: '/teacher/upsertClass',
			type: 'POST',
			data: update
		}).fail(function(err) {
			say.error(err);
		}).done(function(data) {
			this.refreshClasses();
		}.bind(this));
	},

	refreshAssignments: function() {
		if(this.selectedClassId) {
			$.ajax({
				url: '/teacher/getAssignments?classId=' + this.selectedClassId,
				type: 'GET'
			}).fail(function(err) {
				say.error(err);
			}).done(function(data) {
				data.push({});
				this.setState({assignments: data});
			}.bind(this));
		}
	},

	updateAssignments: function(update) {
		console.log('update assignments');
		console.log(update);
		//if(this.selectClassId) {
		$.ajax({
			url: '/teacher/upsertAssignment',
			type: 'POST',
			data: update
		}).fail(function(err) {
			say.error(err);
		}).done(function(data) {
			this.refreshAssignments();
		}.bind(this));
	//	}
	}


});


var DateCell = React.createClass({
	render: function() {
		return (
			<div>
				<DatePicker selected={moment(this.props.date)} onChange={this.datePickerChanged} />
			</div>
		);
	},

	datePickerChanged: function(date) {
		this.props.onChange(this.props._id, date.format());
	}

});




module.exports = TeacherDashboard;