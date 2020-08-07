/*
	Copyright (c) DeltaNedas 2020

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

(() => {

if (this.global.toolbox.uieditor) {
	module.exports = this.global.toolbox.uieditor;
	return;
}

const uieditor = {
	workspace: [],
	elements: require("elements")
};
const elements = uieditor.elements;

uieditor.selectElement = callback => {
	uieditor.elementDialog.select(callback);
};

uieditor.selectProperty = element => {
	uieditor.propDialog.rebuild(element, name => {
		element.properties[name] = element.type.properties[name].def;
		uieditor.editElement(element);
	});
};

uieditor.buildSelections = () => {
	uieditor.elementDialog = extendContent(BaseDialog, "$toolbox.uieditor.elements", {
		select(callback) {
			const t = this.cont;
			t.clear();
			t.pane(elems => {
				for (let i in elements) {
					const name = i;
					t.button(name, () => {
						callback(name);
					});
					t.row();
				}
			}).width(300).height(400).center();
			this.show();
		}
	});
};

/* Menu impl */

uieditor.build = () => {
	const squarei = new ImageButton.ImageButtonStyle();
	squarei.up = squarei.checked = Tex.buttonSquare;
	squarei.down = Tex.buttonSquareDown;
	squarei.over = squarei.checkedOver = Tex.buttonSquareOver;

	const dialog = extendContent(BaseDialog, "$toolbox.uieditor", {
		addElement(name, props) {
			const type = elements[name];
			const element = {
				name: name,
				type: type,
				cell: type.new ? preview.add(type.new()) : null,
				properties: {}
			};

			for (var i in type.properties) {
				element.properties[i] = type.properties[i].def;
			}

			Object.assign(element.properties, props || {});

			if (type.add) type.add(element, preview);

			uieditor.workspace.push(element);
			this.apply(element);
			uieditor.rebuild();
			return element;
		},

		apply(element) {
			for (var i in element.properties) {
				let value = element.properties[i];
				let type = element.type.properties[i];
				type.apply(element, value);
			}
		}
	});

	const t = dialog.cont;
	const elemw = t.table().growY().width(250).left().get();
	elemw.add("$toolbox.uieditor.elements");
	elemw.row();
	elemw.pane(elems => {
		elems.background(Tex.buttonSquare);
		elems.defaults().pad(6).height(32).top();

		uieditor.rebuild = () => {
			elems.clear();
			for (var i in uieditor.workspace) {
				const element = uieditor.workspace[i];
				elems.button(element.name, Styles.squaret, () => {
					uieditor.editElement(element);
				}).width(200 - 42).left();

				const index = i;
				elems.button(Icon.trash, squarei, () => {
					uieditor.workspace.splice(index, 1);
					uieditor.rebuild();
				}).size(32).left();
				elems.row();
			}

			/* Separator */
			if (i !== undefined) {
				elems.image().size(200, 4).color(Pal.accent).pad(16);
				elems.row();
			}

			elems.button(Icon.add, squarei, () => {
				uieditor.selectElement(name => {
					dialog.addElement(name);
				});
			}).size(48).padTop(16);
		};
	}).growY().width(250);

	const preview = t.table().grow().center().get();
	dialog.preview = preview;

	dialog.addElement("Label", {
		text: "Anuken"
	});

	const propw = t.table().growY().width(300).center().right().get();
	propw.add("$toolbox.uieditor.properties");
	propw.row();
	propw.pane(props => {
		props.background(Tex.buttonSquare);
		props.defaults().pad(8);

		uieditor.editElement = element => {
			props.clear();

			for (var i in element.properties) {
				const prop = props.table().growX().get();
				const name = i;
				prop.background(Tex.buttonSquare);

				prop.add(name).width(70).padRight(10);
				element.type.properties[name].build(element, element.properties[name], prop);

				props.button(Icon.trash, squarei, () => {
					delete element.properties[name];
					uieditor.editElement(element);
				}).right();
				props.row();
			}

			/* Don't add the button if there are no more properties */
			if (Object.keys(element.properties).length ==
				Object.keys(element.type.properties).length) {
				return false;
			}

			/* Separator */
			if (i !== undefined) {
				props.image().height(4).growX().pad(16).color(Pal.accent);
				props.row();
			}

			props.button(Icon.add, squarei, () => {
				uieditor.selectProperty(element);
			});

			return true;
		};
	}).grow();

	uieditor.buildSelections();

	dialog.addCloseButton();
/*	dialog.buttons.button(Icon.export, "$export", () => {
		uieditor.showExport();
	}); */
	return dialog;
};

uieditor.add = t => {
	t.button("$toolbox.uieditor", () => {
		uieditor.dialog.show();
	});
};

uieditor.load = () => {

};

module.exports = uieditor;
this.global.uieditor = uieditor;

})();
