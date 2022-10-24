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

### Chain of Responsibility

Chain of Responsibility: is a behavioral design pattern that lets you pass requests along a chain of handlers. Upon receiving a request, each handler decides either to process the request or to pass it to the next handler in the chain.

![](/image/Chain-of-Responsibility.svg)

### Command

Command: is a behavioral design pattern that turns a request into a stand-alone object that contains all information about the request. This transformation lets you pass requests as a method arguments, delay or queue a request’s execution, and support undoable operations.

![](/image/Command.svg)

### Iterator

Iterator: Lets you traverse elements of a collection without exposing its underlying representation (list, stack, tree, etc.). 

![](/image/Iterator.svg)

### Observer

Observer: Lets you define a subscription mechanism to notify multiple objects about any events that happen to the object they're observing.

![](/image/Observer.svg)

### State

State: Lets an object alter its behavior when its internal state changes. It appears as if the object changed its class.

![](/image/State.svg)

### Strategy

Strategy: Lets you define a family of algorithms, put each of them into a separate class, and make their objects interchangeable.

![](/image/Strategy.svg)

### Template Method

Template Method: Defines the skeleton of an algorithm in the superclass but lets subclasses override specific steps of the algorithm without changing its structure.

![](/image/Template-Method.svg)

### Memento

Memento: Lets you save and restore the previous state of an object without revealing the details of its implementation.

- Implementation based on nested classes

![](/image/Memento-nested-classes.svg)

- Implementation based on an intermediate interface

![](/image/Memento-intermediate-interface.svg)

- Implementation with even stricter encapsulation

![](/image/Memento-stricter-encapsulation.svg)

### Visitor

Visitor: Lets you separate algorithms from the objects on which they operate.

![](/image/Visitor.svg)

### Mediator

Mediator: Lets you reduce chaotic dependencies between objects. The pattern restricts direct communications between the objects and forces them to collaborate only via a mediator object.

![](/image/Mediator.svg)
