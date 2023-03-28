# NestJS GraphQL demo

A NestJS GraphQL demo API (code-first) with Passport authentication (JWT), TypeORM (SQLite) as database implementation, e2e/integration/unit testing and some other stuff.

You are free to explore and use the code at your convenience. I hope you find it useful and thanks for reading. ❤️

## More thoughts on GraphQL (TL;DR)

As a continuation of my [express-graphql-demo](https://github.com/DevCorvus/express-graphql-demo) project I decided to make another "iteration" for GraphQL, this time with NestJS which is a framework that has a really nice integration with it. I used different tools, new approaches and expanded features compared to the previous demo in order to dive into more "real-world" scenarios for GraphQL. In general, the results were way better than before not only for the API because it's obviously more robust and complete but also in terms of learning and comprehension of its use-cases which was the main goal.

As a general remark, there are even more complexities involved when you want to get things _right_ like I tried with this demo. I feel like there is a lack of clear guidelines or standards for GraphQL beyond its fundamentals (at least for now), which is especially noticeable, for example, on error handling. Nevertheless, NestJS as an opinionated framework comes in handy to alleviate some of these drawbacks but not all of them.

I actually think the best way to take advantage of GraphQL is when you combine it with REST architecture. Because fetching data usually demands more endpoints to get specific and hence optimized results... you can just **fetch** all you need from GraphQL and leave pretty much all **mutations** to REST (subscriptions are another matter), it's like the best of both worlds!

_\- DevCorvus_
