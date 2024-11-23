This is the Habit Builder page.

I came up with this idea because I wanted to have a project for my portfolio. At first I wanted to make a to do list, but I decided to take it to the next level.

Backend development is my strongest suit, so I'll be only working on the backend first and then I'll build the best frontend that I can.

This app is supposed to be used to help people build habits, with the ability of earning points each time a habit is completed. These points allow leveling up and depending on a theme
that was chosen when the user was created, each level will have a different name. Also, a badge will be assigned to a habit upon creation if it contains the badge's keyword. As the 
habit is completed the badge can also level up, giving more points after each completion.

It is possible to change the user's email address or username, as well as the password. Habits can be added with a date and then it'll be marked as in progress if it's added on 
the current day, or scheduled if it's a future one. Habits can only be completed on the day of its deadline, future ones can only be deleted, not marked as completed. Once completed
the points are given and if enough completions are made (for badge levels) or enough points are accumulated (for user levels) then leveling up will occur automatically. Users can also 
make badge suggestions, if it's accepted or rejected, they'll receive an email informing them about the decision.

In the config folder, within the user folder, there is a script.sql file where all the tables, indexes and triggers are created. Also, the information for the levels and badges is 
inserted in the tables with the information of the amounts of points given after each habit completion and the points or completions required for each user or badge level.

This is a work in progress, so I'll be updating it as more features are added or fixed.

There is a pending folder with .txt files where I'll be adding new features of things I want to improve.
