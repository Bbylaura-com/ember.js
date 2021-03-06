import { moduleFor, RenderingTestCase, strip, classes, runTask } from 'internal-test-helpers';

import { set, computed } from '@ember/-internals/metal';

import { Component } from '../../utils/helpers';

moduleFor(
  'ClassNameBindings integration',
  class extends RenderingTestCase {
    ['@test it can have class name bindings on the class definition']() {
      let FooBarComponent = Component.extend({
        classNameBindings: ['foo', 'isEnabled:enabled', 'isHappy:happy:sad'],
      });

      this.registerComponent('foo-bar', {
        ComponentClass: FooBarComponent,
        template: 'hello',
      });

      this.render('{{foo-bar foo=this.foo isEnabled=this.isEnabled isHappy=this.isHappy}}', {
        foo: 'foo',
        isEnabled: true,
        isHappy: false,
      });

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view foo enabled sad') },
        content: 'hello',
      });

      runTask(() => this.rerender());

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view foo enabled sad') },
        content: 'hello',
      });

      runTask(() => {
        set(this.context, 'foo', 'FOO');
        set(this.context, 'isEnabled', false);
      });

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view FOO sad') },
        content: 'hello',
      });

      runTask(() => {
        set(this.context, 'foo', undefined);
        set(this.context, 'isHappy', true);
      });

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view happy') },
        content: 'hello',
      });

      runTask(() => {
        set(this.context, 'foo', 'foo');
        set(this.context, 'isEnabled', true);
        set(this.context, 'isHappy', false);
      });

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view foo enabled sad') },
        content: 'hello',
      });
    }

    ['@test attrs in classNameBindings']() {
      let FooBarComponent = Component.extend({
        classNameBindings: ['attrs.joker:purple:green', 'attrs.batman.robin:black:red'],
      });

      this.registerComponent('foo-bar', {
        ComponentClass: FooBarComponent,
        template: 'hello',
      });

      this.render('{{foo-bar joker=this.model.wat batman=this.model.super}}', {
        model: { wat: false, super: { robin: true } },
      });

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view green black') },
        content: 'hello',
      });

      runTask(() => this.rerender());

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view green black') },
        content: 'hello',
      });

      runTask(() => {
        set(this.context, 'model.wat', true);
        set(this.context, 'model.super.robin', false);
      });

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view purple red') },
        content: 'hello',
      });

      runTask(() =>
        set(this.context, 'model', {
          wat: false,
          super: { robin: true },
        })
      );

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view green black') },
        content: 'hello',
      });
    }

    ['@test it can have class name bindings in the template']() {
      expectDeprecation(
        "Passing the `classNameBindings` property as an argument within templates has been deprecated. Instead, you can pass the class argument and use concatenation to produce the class value dynamically. ('-top-level' @ L1:C0) "
      );

      this.registerComponent('foo-bar', { template: 'hello' });

      this.render(
        '{{foo-bar classNameBindings="this.model.someInitiallyTrueProperty this.model.someInitiallyFalseProperty this.model.someInitiallyUndefinedProperty :static this.model.isBig:big this.model.isOpen:open:closed this.model.isUp::down this.model.bar:isTruthy:isFalsy"}}',
        {
          model: {
            someInitiallyTrueProperty: true,
            someInitiallyFalseProperty: false,
            isBig: true,
            isOpen: false,
            isUp: true,
            bar: true,
          },
        }
      );

      this.assertComponentElement(this.firstChild, {
        attrs: {
          class: classes('ember-view some-initially-true-property static big closed isTruthy'),
        },
        content: 'hello',
      });

      runTask(() => this.rerender());

      this.assertComponentElement(this.firstChild, {
        attrs: {
          class: classes('ember-view some-initially-true-property static big closed isTruthy'),
        },
        content: 'hello',
      });

      runTask(() => {
        set(this.context, 'model.someInitiallyTrueProperty', false);
        set(this.context, 'model.someInitiallyFalseProperty', true);
        set(this.context, 'model.someInitiallyUndefinedProperty', true);
        set(this.context, 'model.isBig', false);
        set(this.context, 'model.isOpen', true);
        set(this.context, 'model.isUp', false);
        set(this.context, 'model.bar', false);
      });

      this.assertComponentElement(this.firstChild, {
        attrs: {
          class: classes(
            'ember-view some-initially-false-property some-initially-undefined-property static open down isFalsy'
          ),
        },
        content: 'hello',
      });

      runTask(() => {
        set(this.context, 'model', {
          someInitiallyTrueProperty: true,
          someInitiallyFalseProperty: false,
          someInitiallyUndefinedProperty: undefined,
          isBig: true,
          isOpen: false,
          isUp: true,
          bar: true,
        });
      });

      this.assertComponentElement(this.firstChild, {
        attrs: {
          class: classes('ember-view some-initially-true-property static big closed isTruthy'),
        },
        content: 'hello',
      });
    }

    ['@test it can have class name bindings with nested paths']() {
      let FooBarComponent = Component.extend({
        classNameBindings: ['foo.bar', 'is.enabled:enabled', 'is.happy:happy:sad'],
      });

      this.registerComponent('foo-bar', {
        ComponentClass: FooBarComponent,
        template: 'hello',
      });

      this.render('{{foo-bar foo=this.foo is=this.is}}', {
        foo: { bar: 'foo-bar' },
        is: { enabled: true, happy: false },
      });

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view foo-bar enabled sad') },
        content: 'hello',
      });

      runTask(() => this.rerender());

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view foo-bar enabled sad') },
        content: 'hello',
      });

      runTask(() => {
        set(this.context, 'foo.bar', 'FOO-BAR');
        set(this.context, 'is.enabled', false);
      });

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view FOO-BAR sad') },
        content: 'hello',
      });

      runTask(() => {
        set(this.context, 'foo.bar', null);
        set(this.context, 'is.happy', true);
      });

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view happy') },
        content: 'hello',
      });

      runTask(() => {
        set(this.context, 'foo', null);
        set(this.context, 'is', null);
      });

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view sad') },
        content: 'hello',
      });

      runTask(() => {
        set(this.context, 'foo', { bar: 'foo-bar' });
        set(this.context, 'is', { enabled: true, happy: false });
      });

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view foo-bar enabled sad') },
        content: 'hello',
      });
    }

    ['@test it should dasherize the path when the it resolves to true']() {
      let FooBarComponent = Component.extend({
        classNameBindings: ['fooBar', 'nested.fooBarBaz'],
      });

      this.registerComponent('foo-bar', {
        ComponentClass: FooBarComponent,
        template: 'hello',
      });

      this.render('{{foo-bar fooBar=this.fooBar nested=this.nested}}', {
        fooBar: true,
        nested: { fooBarBaz: false },
      });

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view foo-bar') },
        content: 'hello',
      });

      runTask(() => this.rerender());

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view foo-bar') },
        content: 'hello',
      });

      runTask(() => {
        set(this.context, 'fooBar', false);
        set(this.context, 'nested.fooBarBaz', true);
      });

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view foo-bar-baz') },
        content: 'hello',
      });

      runTask(() => {
        set(this.context, 'fooBar', 'FOO-BAR');
        set(this.context, 'nested.fooBarBaz', null);
      });

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view FOO-BAR') },
        content: 'hello',
      });

      runTask(() => set(this.context, 'nested', null));

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view FOO-BAR') },
        content: 'hello',
      });

      runTask(() => {
        set(this.context, 'fooBar', true);
        set(this.context, 'nested', { fooBarBaz: false });
      });

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view foo-bar') },
        content: 'hello',
      });
    }

    ['@test const bindings can be set as attrs']() {
      expectDeprecation(
        "Passing the `classNameBindings` property as an argument within templates has been deprecated. Instead, you can pass the class argument and use concatenation to produce the class value dynamically. ('-top-level' @ L1:C0) "
      );

      this.registerComponent('foo-bar', { template: 'hello' });
      this.render('{{foo-bar classNameBindings="this.foo:enabled:disabled"}}', {
        foo: true,
      });

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view enabled') },
        content: 'hello',
      });

      runTask(() => this.rerender());

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view enabled') },
        content: 'hello',
      });

      runTask(() => set(this.context, 'foo', false));

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view disabled') },
        content: 'hello',
      });

      runTask(() => set(this.context, 'foo', true));

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view enabled') },
        content: 'hello',
      });
    }

    ['@test :: class name syntax works with an empty true class']() {
      let FooBarComponent = Component.extend({
        classNameBindings: ['isEnabled::not-enabled'],
      });

      this.registerComponent('foo-bar', {
        ComponentClass: FooBarComponent,
        template: 'hello',
      });

      this.render('{{foo-bar isEnabled=this.enabled}}', {
        enabled: false,
      });

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view not-enabled') },
        content: 'hello',
      });

      runTask(() => set(this.context, 'enabled', true));

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view') },
        content: 'hello',
      });

      runTask(() => set(this.context, 'enabled', false));

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view not-enabled') },
        content: 'hello',
      });
    }

    ['@test uses all provided static class names (issue #11193)']() {
      let FooBarComponent = Component.extend({
        classNameBindings: [':class-one', ':class-two'],
      });

      this.registerComponent('foo-bar', {
        ComponentClass: FooBarComponent,
        template: 'hello',
      });

      this.render('{{foo-bar}}', {
        enabled: false,
      });

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view class-one class-two') },
        content: 'hello',
      });

      runTask(() => set(this.context, 'enabled', true));

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        attrs: { class: classes('ember-view class-one class-two') },
        content: 'hello',
      });
    }

    ['@test Providing a binding with a space in it asserts']() {
      let FooBarComponent = Component.extend({
        classNameBindings: 'i:think:i am:so:clever',
      });

      this.registerComponent('foo-bar', {
        ComponentClass: FooBarComponent,
        template: 'hello',
      });

      expectAssertion(() => {
        this.render('{{foo-bar}}');
      }, /classNameBindings must not have spaces in them/i);
    }

    ['@test it asserts that items must be strings']() {
      let FooBarComponent = Component.extend({
        foo: 'foo',
        bar: 'bar',
        classNameBindings: ['foo', , 'bar'], // eslint-disable-line no-sparse-arrays
      });

      this.registerComponent('foo-bar', {
        ComponentClass: FooBarComponent,
        template: 'hello',
      });

      expectAssertion(() => {
        this.render('{{foo-bar}}');
      }, /classNameBindings must be non-empty strings/);
    }

    ['@test it asserts that items must be non-empty strings']() {
      let FooBarComponent = Component.extend({
        foo: 'foo',
        bar: 'bar',
        classNameBindings: ['foo', '', 'bar'],
      });

      this.registerComponent('foo-bar', {
        ComponentClass: FooBarComponent,
        template: 'hello',
      });

      expectAssertion(() => {
        this.render('{{foo-bar}}');
      }, /classNameBindings must be non-empty strings/);
    }

    ['@test it can set class name bindings in the constructor']() {
      let FooBarComponent = Component.extend({
        classNameBindings: ['foo'],

        init() {
          this._super();

          let bindings = (this.classNameBindings = this.classNameBindings.slice());

          if (this.get('bindIsEnabled')) {
            bindings.push('isEnabled:enabled');
          }

          if (this.get('bindIsHappy')) {
            bindings.push('isHappy:happy:sad');
          }
        },
      });

      this.registerComponent('foo-bar', {
        ComponentClass: FooBarComponent,
        template: 'hello',
      });

      this.render(
        strip`
      {{foo-bar foo=this.foo bindIsEnabled=true isEnabled=this.isEnabled bindIsHappy=false isHappy=this.isHappy}}
      {{foo-bar foo=this.foo bindIsEnabled=false isEnabled=this.isEnabled bindIsHappy=true isHappy=this.isHappy}}
      {{foo-bar foo=this.foo bindIsEnabled=true isEnabled=this.isEnabled bindIsHappy=true isHappy=this.isHappy}}
      {{foo-bar foo=this.foo bindIsEnabled=false isEnabled=this.isEnabled bindIsHappy=false isHappy=this.isHappy}}
    `,
        { foo: 'foo', isEnabled: true, isHappy: false }
      );

      this.assertComponentElement(this.nthChild(0), {
        tagName: 'div',
        attrs: { class: classes('ember-view foo enabled') },
        content: 'hello',
      });
      this.assertComponentElement(this.nthChild(1), {
        tagName: 'div',
        attrs: { class: classes('ember-view foo sad') },
        content: 'hello',
      });
      this.assertComponentElement(this.nthChild(2), {
        tagName: 'div',
        attrs: { class: classes('ember-view foo enabled sad') },
        content: 'hello',
      });
      this.assertComponentElement(this.nthChild(3), {
        tagName: 'div',
        attrs: { class: classes('ember-view foo') },
        content: 'hello',
      });

      runTask(() => this.rerender());

      this.assertComponentElement(this.nthChild(0), {
        tagName: 'div',
        attrs: { class: classes('ember-view foo enabled') },
        content: 'hello',
      });
      this.assertComponentElement(this.nthChild(1), {
        tagName: 'div',
        attrs: { class: classes('ember-view foo sad') },
        content: 'hello',
      });
      this.assertComponentElement(this.nthChild(2), {
        tagName: 'div',
        attrs: { class: classes('ember-view foo enabled sad') },
        content: 'hello',
      });
      this.assertComponentElement(this.nthChild(3), {
        tagName: 'div',
        attrs: { class: classes('ember-view foo') },
        content: 'hello',
      });

      runTask(() => {
        set(this.context, 'foo', 'FOO');
        set(this.context, 'isEnabled', false);
      });

      this.assertComponentElement(this.nthChild(0), {
        tagName: 'div',
        attrs: { class: classes('ember-view FOO') },
        content: 'hello',
      });
      this.assertComponentElement(this.nthChild(1), {
        tagName: 'div',
        attrs: { class: classes('ember-view FOO sad') },
        content: 'hello',
      });
      this.assertComponentElement(this.nthChild(2), {
        tagName: 'div',
        attrs: { class: classes('ember-view FOO sad') },
        content: 'hello',
      });
      this.assertComponentElement(this.nthChild(3), {
        tagName: 'div',
        attrs: { class: classes('ember-view FOO') },
        content: 'hello',
      });

      runTask(() => {
        set(this.context, 'foo', undefined);
        set(this.context, 'isHappy', true);
      });

      this.assertComponentElement(this.nthChild(0), {
        tagName: 'div',
        attrs: { class: classes('ember-view') },
        content: 'hello',
      });
      this.assertComponentElement(this.nthChild(1), {
        tagName: 'div',
        attrs: { class: classes('ember-view happy') },
        content: 'hello',
      });
      this.assertComponentElement(this.nthChild(2), {
        tagName: 'div',
        attrs: { class: classes('ember-view happy') },
        content: 'hello',
      });
      this.assertComponentElement(this.nthChild(3), {
        tagName: 'div',
        attrs: { class: classes('ember-view') },
        content: 'hello',
      });

      runTask(() => {
        set(this.context, 'foo', 'foo');
        set(this.context, 'isEnabled', true);
        set(this.context, 'isHappy', false);
      });

      this.assertComponentElement(this.nthChild(0), {
        tagName: 'div',
        attrs: { class: classes('ember-view foo enabled') },
        content: 'hello',
      });
      this.assertComponentElement(this.nthChild(1), {
        tagName: 'div',
        attrs: { class: classes('ember-view foo sad') },
        content: 'hello',
      });
      this.assertComponentElement(this.nthChild(2), {
        tagName: 'div',
        attrs: { class: classes('ember-view foo enabled sad') },
        content: 'hello',
      });
      this.assertComponentElement(this.nthChild(3), {
        tagName: 'div',
        attrs: { class: classes('ember-view foo') },
        content: 'hello',
      });
    }

    ['@test using a computed property for classNameBindings triggers an assertion']() {
      let FooBarComponent = Component.extend({
        classNameBindings: computed(function () {
          return ['isHappy:happy:sad'];
        }),
      });

      this.registerComponent('foo-bar', {
        ComponentClass: FooBarComponent,
        template: 'hello',
      });

      expectAssertion(() => {
        this.render('{{foo-bar}}');
      }, /Only arrays are allowed/);
    }
  }
);

moduleFor(
  'ClassBinding integration',
  class extends RenderingTestCase {
    ['@test it should apply classBinding without condition always']() {
      expectDeprecation(
        "Passing the `classBinding` property as an argument within templates has been deprecated. Instead, you can pass the class argument and use concatenation to produce the class value dynamically. ('-top-level' @ L1:C0) "
      );

      this.registerComponent('foo-bar', { template: 'hello' });

      this.render('{{foo-bar classBinding=":foo"}}');

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        content: 'hello',
        attrs: { class: classes('foo  ember-view') },
      });

      runTask(() => this.rerender());

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        content: 'hello',
        attrs: { class: classes('foo  ember-view') },
      });
    }

    ['@test it should merge classBinding with class']() {
      expectDeprecation(
        "Passing the `classBinding` property as an argument within templates has been deprecated. Instead, you can pass the class argument and use concatenation to produce the class value dynamically. ('-top-level' @ L1:C0) "
      );

      this.registerComponent('foo-bar', { template: 'hello' });

      this.render('{{foo-bar classBinding="this.birdman:respeck" class="myName"}}', {
        birdman: true,
      });

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        content: 'hello',
        attrs: { class: classes('respeck myName ember-view') },
      });

      runTask(() => this.rerender());

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        content: 'hello',
        attrs: { class: classes('respeck myName ember-view') },
      });
    }

    ['@test it should apply classBinding with only truthy condition']() {
      expectDeprecation(
        "Passing the `classBinding` property as an argument within templates has been deprecated. Instead, you can pass the class argument and use concatenation to produce the class value dynamically. ('-top-level' @ L1:C0) "
      );

      this.registerComponent('foo-bar', { template: 'hello' });

      this.render('{{foo-bar classBinding="this.myName:respeck"}}', {
        myName: true,
      });

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        content: 'hello',
        attrs: { class: classes('respeck  ember-view') },
      });

      runTask(() => this.rerender());

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        content: 'hello',
        attrs: { class: classes('respeck  ember-view') },
      });
    }

    ['@test it should apply classBinding with only falsy condition']() {
      expectDeprecation(
        "Passing the `classBinding` property as an argument within templates has been deprecated. Instead, you can pass the class argument and use concatenation to produce the class value dynamically. ('-top-level' @ L1:C0) "
      );

      this.registerComponent('foo-bar', { template: 'hello' });

      this.render('{{foo-bar classBinding="this.myName::shade"}}', {
        myName: false,
      });

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        content: 'hello',
        attrs: { class: classes('shade  ember-view') },
      });

      runTask(() => this.rerender());

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        content: 'hello',
        attrs: { class: classes('shade  ember-view') },
      });
    }

    ['@test it should apply nothing when classBinding is falsy but only supplies truthy class']() {
      expectDeprecation(
        "Passing the `classBinding` property as an argument within templates has been deprecated. Instead, you can pass the class argument and use concatenation to produce the class value dynamically. ('-top-level' @ L1:C0) "
      );

      this.registerComponent('foo-bar', { template: 'hello' });

      this.render('{{foo-bar classBinding="this.myName:respeck"}}', {
        myName: false,
      });

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        content: 'hello',
        attrs: { class: classes('ember-view') },
      });

      runTask(() => this.rerender());

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        content: 'hello',
        attrs: { class: classes('ember-view') },
      });
    }

    ['@test it should apply nothing when classBinding is truthy but only supplies falsy class']() {
      expectDeprecation(
        "Passing the `classBinding` property as an argument within templates has been deprecated. Instead, you can pass the class argument and use concatenation to produce the class value dynamically. ('-top-level' @ L1:C0) "
      );

      this.registerComponent('foo-bar', { template: 'hello' });

      this.render('{{foo-bar classBinding="this.myName::shade"}}', { myName: true });

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        content: 'hello',
        attrs: { class: classes('ember-view') },
      });

      runTask(() => this.rerender());

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        content: 'hello',
        attrs: { class: classes('ember-view') },
      });
    }

    ['@test it should apply classBinding with falsy condition']() {
      expectDeprecation(
        "Passing the `classBinding` property as an argument within templates has been deprecated. Instead, you can pass the class argument and use concatenation to produce the class value dynamically. ('-top-level' @ L1:C0) "
      );

      this.registerComponent('foo-bar', { template: 'hello' });

      this.render('{{foo-bar classBinding="this.swag:fresh:scrub"}}', {
        swag: false,
      });

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        content: 'hello',
        attrs: { class: classes('scrub  ember-view') },
      });

      runTask(() => this.rerender());

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        content: 'hello',
        attrs: { class: classes('scrub  ember-view') },
      });
    }

    ['@test it should apply classBinding with truthy condition']() {
      expectDeprecation(
        "Passing the `classBinding` property as an argument within templates has been deprecated. Instead, you can pass the class argument and use concatenation to produce the class value dynamically. ('-top-level' @ L1:C0) "
      );

      this.registerComponent('foo-bar', { template: 'hello' });

      this.render('{{foo-bar classBinding="this.swag:fresh:scrub"}}', {
        swag: true,
      });

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        content: 'hello',
        attrs: { class: classes('fresh  ember-view') },
      });

      runTask(() => this.rerender());

      this.assertComponentElement(this.firstChild, {
        tagName: 'div',
        content: 'hello',
        attrs: { class: classes('fresh  ember-view') },
      });
    }
  }
);
