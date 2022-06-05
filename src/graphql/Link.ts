import {extendType, intArg, nonNull, objectType, stringArg} from "nexus";
import {NexusGenObjects} from "../../nexus-typegen";

export const link = objectType({
    name: "Link",
    definition(t) {
        t.nonNull.int("id");
        t.nonNull.string("description");
        t.nonNull.string("url");
        t.field("postedBy", {
            type: "User",
            resolve(parent, args, context) {
                return context.prisma.link
                    .findUnique({ where: { id: parent.id }})
                    .postedBy()
            },
        });
    },
});

export const LinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("feed", {
            type: "Link",
            resolve(parent, args, context, info) {
                return context.prisma.link.findMany();
            },
        });
        t.nonNull.field("link", {
            type: "Link",
            args: {
                id: nonNull(intArg()),
            },
            resolve(parent, args, context) {
                const { id } = args;
                return context.prisma.link.findUnique({
                    where: {
                        id
                    }
                });
            }
        });
    },
});

export const linkMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("post", {
            type: "Link",
            args: {
                description: nonNull(stringArg()),
                url: nonNull(stringArg()),
            },
            resolve(parent, args, context) {
                const { description, url } = args;
                const { userId } = context;

                if (!userId) {
                    throw new Error("Cannot post without logging in.");
                }

                return context.prisma.link.create({
                    data: {
                        description,
                        url,
                        postedBy: { connect: { id: userId } },
                    },
                });
            },
        });

        t.nonNull.field("deleteLink", {
            type: "Link",
            args: {
                id: nonNull(intArg()),
            },
            resolve(parent, args, context) {
                const { id } = args;
                 return context.prisma.link.delete({
                    where: {
                        id
                    },
                });
            }
        });

        t.nonNull.field("UpdateLink", {
            type: "Link",
            args: {
                id: nonNull(intArg()),
                description: stringArg(),
                link: stringArg(),
            },
            resolve: function (parent, args, context) {
                const {id, description, link} = args;
                return context.prisma.link.update({
                    where: {
                        id
                    },
                    data: {
                        description, link
                    },
                });
            }
        })
    },
});
