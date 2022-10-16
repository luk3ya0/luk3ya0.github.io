+++
title = "Design Patterns Cheat Sheets"
description = ""
date = "2020-01-13"
aliases = ["design-pattern-cheat-sheets"]
tags = ["design pattern", "architect", "cheat sheet", "tl;dr"]
author = "Luke Yao"
draft = false
+++

The Structure images for patterns come from refatorguru, and rebuilt by drawio.

## Creational

### Abstract Factory

Abstract Factory: Provides an interface for creating families of related or dependent objects without specifying their concrete classes.

![](/image/AbcFactory.svg)

### Factory

Factory: Defines an interface for creating an object but let subclasses decide which class to instantiate.

![](/image/Factory.svg)

### Builder

Builder: declares product construction steps that are common to all types of builders.

![](/image/Builder.svg)

### Singleton

Singleton: Ensure a class only has one instance and provide a global point of access to it.

![](/image/Singleton.svg)

### Prototype

Prototype: Specifies the kinds of objects to create using a prototypical instance and create new objects by copying this prototype.

![](/image/Prototype.svg)

## Structural

### Bridge

Bridge: Depart implementations of different dimension to decouple the abstraction, avoid creating a bunch of subclasses.

![](/image/Bridge.svg)

### Decorator

Decorator: Attaches additional responsibilities to an object dynamically.

![](/image/Decorator.svg)

### Adapter

Adapter: Adapt real services to the another service adopted by the client using aggregation or inheritance.

- Composition:

![](/image/Adapter-Composition.svg)

- Inheritance:

![](/image/Adapter-Inheritance.svg)

### Composite

Composite: Lets you compose objects into tree structures and then work with these structures as if they were individual objects.

![](/image/Composite.svg)

### Facade

Facade: The *Facade* provides convenient access to a particular part of the subsystem’s functionality. It knows where to direct the client’s request and how to operate all the moving parts.

![](/image/Facade.svg)

### Flyweight

Flyweight: is a structural design pattern that lets you fit more objects into the available amount of RAM by sharing common parts of state between multiple objects instead of keeping all of the data in each object.

![](/image/Flyweight.svg)

### Proxy

Proxy: Lets you provide a substitute or placeholder for another object. A proxy controls access to the original object, allowing you to perform something either before or after the request gets through to the original object.

![](/image/Proxy.svg)

## Behavioral

