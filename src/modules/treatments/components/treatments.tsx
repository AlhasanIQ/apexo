import * as React from 'react';
import { API } from '../../../core';
import { appointmentsData } from '../../appointments';
import { Col, Row } from '../../../assets/components/grid/index';
import { computed, observable } from 'mobx';
import { DataTable } from '../../../assets/components/data-table/data-table.component';
import { escapeRegExp } from '../../../assets/utils/escape-regex';
import {
	Icon,
	IconButton,
	Nav,
	Panel,
	PanelType,
	PrimaryButton,
	TextField
	} from 'office-ui-fabric-react';
import { namespace, Treatment, treatments } from '../data';
import { observer } from 'mobx-react';
import { Profile } from '../../../assets/components/profile/profile';
import { ProfileSquared } from '../../../assets/components/profile/profile-squared';
import { round } from '../../../assets/utils/round';
import { Section } from '../../../assets/components/section/section';
import { settingsData } from '../../settings';
import { sortArrByProp } from '../../../assets/utils/sort-arr';
import { TagInput } from '../../../assets/components/tag-input/tag-input';
import './treatments.scss';

@observer
export class Treatments extends React.Component<{}, {}> {
	@observable selectedID: string = API.router.currentLocation.split('/')[1];

	@computed
	get selectedIndex() {
		return treatments.list.findIndex((x) => x._id === this.selectedID);
	}

	@computed
	get selectedTreatment() {
		return treatments.list[this.selectedIndex];
	}

	render() {
		return (
			<div className="treatments-component p-15 p-l-10 p-r-10">
				<DataTable
					onDelete={(id) => {
						treatments.deleteModal(id);
					}}
					commands={[
						{
							key: 'addNew',
							title: 'Add new',
							name: 'Add New',
							onClick: () => {
								const treatment = new Treatment();
								treatments.list.push(treatment);
								this.selectedID = treatment._id;
							},
							iconProps: {
								iconName: 'Add'
							}
						}
					]}
					heads={[ 'Treatment', 'Expenses/unit', 'Done appointments', 'Upcoming appointments' ]}
					rows={treatments.list.map((treatment) => {
						const now = new Date().getTime();
						let done = 0;
						let upcoming = 0;

						const appointments = appointmentsData.appointments.list;

						for (let index = 0; index < appointments.length; index++) {
							const appointment = appointments[index];
							if (appointment.treatmentID !== treatment._id) {
								continue;
							}
							if (appointment.date > now) {
								upcoming++;
							}
							if (appointment.done) {
								done++;
							}
						}

						return {
							id: treatment._id,
							searchableString: treatment.searchableString,
							cells: [
								{
									dataValue: treatment.type,
									component: (
										<ProfileSquared
											text={treatment.type}
											subText={`Expenses: ${settingsData.settings.getSetting(
												'currencySymbol'
											)}${treatment.expenses} per unit`}
										/>
									),
									onClick: () => {
										this.selectedID = treatment._id;
									},
									className: 'no-label'
								},
								{
									dataValue: treatment.expenses,
									component: (
										<span>
											{settingsData.settings.getSetting('currencySymbol')}
											{treatment.expenses}
										</span>
									),
									className: 'hidden-xs'
								},
								{
									dataValue: done,
									component: <span>{done} done</span>,
									className: 'hidden-xs'
								},
								{
									dataValue: upcoming,
									component: <span>{upcoming} upcoming</span>,
									className: 'hidden-xs'
								}
							]
						};
					})}
				/>

				{this.selectedTreatment ? (
					<Panel
						isOpen={!!this.selectedTreatment}
						type={PanelType.medium}
						closeButtonAriaLabel="Close"
						isLightDismiss={true}
						onDismiss={() => {
							this.selectedID = '';
						}}
						onRenderNavigation={() => (
							<Row className="panel-heading">
								<Col span={20}>
									{this.selectedTreatment ? (
										<ProfileSquared
											text={this.selectedTreatment.type}
											subText={`Expenses: ${settingsData.settings.getSetting(
												'currencySymbol'
											)}${this.selectedTreatment.expenses} per unit`}
										/>
									) : (
										<p />
									)}
								</Col>
								<Col span={4} className="close">
									<IconButton
										iconProps={{ iconName: 'cancel' }}
										onClick={() => {
											this.selectedID = '';
										}}
									/>
								</Col>
							</Row>
						)}
					>
						<div className="treatment-editor">
							<Section title="Treatment details" showByDefault>
								<div className="treatment-input">
									<TextField
										label="Treatment title"
										value={this.selectedTreatment.type}
										onChanged={(val) => (treatments.list[this.selectedIndex].type = val)}
									/>
									<TextField
										label="Treatment expenses (per unit)"
										type="number"
										value={this.selectedTreatment.expenses.toString()}
										onChanged={(val) =>
											(treatments.list[this.selectedIndex].expenses = Number(val))}
										prefix={settingsData.settings.getSetting('currencySymbol')}
									/>
								</div>
							</Section>
						</div>
					</Panel>
				) : (
					''
				)}
			</div>
		);
	}
}
