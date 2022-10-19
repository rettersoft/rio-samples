# Rio_Samples

Rio Code Examples will explain the mechanics of the rio tool. Such as, how to use other sdk's, built-in functions etc. and overall pattern. 

## Installation And Usage

https://docs.retter.io

## email-tutorial
This project sends a weekly news email to the subscribers. 
  ### In This Project You Can Check
    * Scheduling
    * Using other SDK's (Postmark)
    * Communication between classes.
    * Singleton architecture
    * Model Usage
  ### Overall Project
There are two classes. With `Subscribe` class we handle subscription process. When we run `subscribe` method, we will create a subscriber without validation. To validate we mail that subscriber, only when the subscriber clicks to the validation link `validate` method gets called and we validate the user. Other class Mailer handles the weekly mail process. `sendMailToSubscribers` gets the current subscriber list from `Subscriber` class and mails the determined mail to them.
